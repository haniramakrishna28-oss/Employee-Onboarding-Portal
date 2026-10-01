const fs = require('fs');
const path = require('path');
const prisma = require('../config/prisma');

// Helper to recalculate overall onboarding progress
async function recalculateProgress(onboardingId) {
  if (!onboardingId) return;

  const [docs, checklists, tasks, approvals] = await Promise.all([
    prisma.document.findMany({ where: { onboardingId } }),
    prisma.checklistItem.findMany({ where: { onboardingId } }),
    prisma.task.findMany({ where: { onboardingId } }),
    prisma.approval.findMany({ where: { onboardingId } })
  ]);

  // Documents: 35% weight
  const approvedDocs = docs.filter(d => d.status === 'APPROVED').length;
  const docWeight = docs.length > 0 ? (approvedDocs / docs.length) * 35 : 0;

  // Checklists: 25% weight
  const completedChecklists = checklists.filter(c => c.status === 'COMPLETED').length;
  const checklistWeight = checklists.length > 0 ? (completedChecklists / checklists.length) * 25 : 0;

  // Tasks: 20% weight
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskWeight = tasks.length > 0 ? (completedTasks / tasks.length) * 20 : 0;

  // Approvals: 20% weight
  const approvedStages = approvals.filter(a => a.status === 'APPROVED').length;
  const approvalWeight = approvals.length > 0 ? (approvedStages / approvals.length) * 20 : 0;

  const totalProgress = Math.min(100, Math.round(docWeight + checklistWeight + taskWeight + approvalWeight));

  const onboarding = await prisma.onboarding.update({
    where: { id: onboardingId },
    data: {
      overallProgress: totalProgress,
      status: totalProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      currentStage: totalProgress === 100 ? 'COMPLETED' : undefined
    }
  });

  // Also update employee cached progress
  await prisma.employee.update({
    where: { id: onboarding.employeeId },
    data: {
      progressPercentage: totalProgress,
      onboardingStatus: totalProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
    }
  });
}

// 1. Get current employee's documents
async function getMyDocuments(req, res) {
  try {
    const employee = req.user.employee;
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const documents = await prisma.document.findMany({
      where: { employeeId: employee.id },
      include: {
        verifiedBy: {
          select: { email: true, employee: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve documents.' });
  }
}

// 2. Get documents for specific employee (HR, Manager, Admin)
async function getEmployeeDocuments(req, res) {
  try {
    const { employeeId } = req.params;

    const documents = await prisma.document.findMany({
      where: { employeeId },
      include: {
        verifiedBy: {
          select: { email: true, employee: { select: { firstName: true, lastName: true } } }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return res.status(200).json({ success: true, documents });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee documents.' });
  }
}

// 3. Upload Document
async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded or file format rejected.' });
    }

    const { category } = req.body;
    const employee = req.user.employee;
    if (!employee) {
      return res.status(403).json({ success: false, message: 'No employee account linked.' });
    }

    const validCategories = [
      'RESUME',
      'ID_PROOF',
      'ADDRESS_PROOF',
      'EDUCATION_CERT',
      'PREV_EMPLOYMENT',
      'BANK_DETAILS',
      'OTHER'
    ];

    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Valid document category is required.' });
    }

    // Find active onboarding
    const onboarding = await prisma.onboarding.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: 'COMPLETED' }
      }
    });

    const storedFilename = req.file.filename;
    const filePath = `/uploads/documents/${storedFilename}`;

    // If an existing document in this category was rejected, replace it or create fresh
    const existingDoc = await prisma.document.findFirst({
      where: {
        employeeId: employee.id,
        category
      }
    });

    let document;
    if (existingDoc && existingDoc.status !== 'APPROVED') {
      // Remove old file from disk if present
      try {
        const oldDiskPath = path.join(__dirname, '../../uploads/documents', existingDoc.storedFilename);
        if (fs.existsSync(oldDiskPath)) fs.unlinkSync(oldDiskPath);
      } catch (e) {
        console.error('Error removing old file:', e);
      }

      document = await prisma.document.update({
        where: { id: existingDoc.id },
        data: {
          originalFilename: req.file.originalname,
          storedFilename,
          filePath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: 'UPLOADED',
          rejectionReason: null,
          verifiedById: null,
          verifiedAt: null
        }
      });
    } else {
      document = await prisma.document.create({
        data: {
          employeeId: employee.id,
          onboardingId: onboarding ? onboarding.id : null,
          category,
          originalFilename: req.file.originalname,
          storedFilename,
          filePath,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          status: 'UPLOADED'
        }
      });
    }

    // Update progress
    if (onboarding) {
      await recalculateProgress(onboarding.id);
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DOCUMENT_UPLOADED',
        entity: 'DOCUMENT',
        entityId: document.id,
        details: JSON.stringify({ category, filename: req.file.originalname, size: req.file.size }),
        ipAddress: req.ip
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully and queued for review.',
      document
    });
  } catch (error) {
    console.error('Upload document error:', error);
    return res.status(500).json({ success: false, message: 'Error saving uploaded document.' });
  }
}

// 4. Review Document (HR or Admin: Approve / Reject / Under Review)
async function reviewDocument(req, res) {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; // action: 'APPROVE' | 'REJECT' | 'UNDER_REVIEW'

    const validActions = ['APPROVE', 'REJECT', 'UNDER_REVIEW'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be APPROVE, REJECT, or UNDER_REVIEW.' });
    }

    if (action === 'REJECT' && (!rejectionReason || !rejectionReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Rejection comments are mandatory when rejecting a document.'
      });
    }

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        employee: { include: { user: true } }
      }
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    let status = 'UNDER_REVIEW';
    let verifiedAt = null;
    let verifiedById = null;

    if (action === 'APPROVE') {
      status = 'APPROVED';
      verifiedAt = new Date();
      verifiedById = req.user.id;
    } else if (action === 'REJECT') {
      status = 'REJECTED';
      verifiedAt = new Date();
      verifiedById = req.user.id;
    }

    const updatedDoc = await prisma.document.update({
      where: { id },
      data: {
        status,
        rejectionReason: action === 'REJECT' ? rejectionReason.trim() : null,
        verifiedById,
        verifiedAt
      }
    });

    // Notify employee of review outcome
    if (action === 'REJECT' || action === 'APPROVE') {
      await prisma.notification.create({
        data: {
          userId: document.employee.userId,
          title: action === 'APPROVE' ? `Document Approved: ${document.category}` : `Action Required: Document Rejected (${document.category})`,
          message: action === 'APPROVE' 
            ? `Your ${document.category.replace(/_/g, ' ')} was verified and approved by HR.`
            : `Your ${document.category.replace(/_/g, ' ')} was rejected: "${rejectionReason.trim()}". Please review feedback and re-upload.`,
          type: action === 'APPROVE' ? 'SUCCESS' : 'WARNING',
          link: '/employee/documents'
        }
      });
    }

    // Recalculate onboarding progress
    if (document.onboardingId) {
      await recalculateProgress(document.onboardingId);
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: `DOCUMENT_${action}`,
        entity: 'DOCUMENT',
        entityId: id,
        details: JSON.stringify({
          action,
          rejectionReason: action === 'REJECT' ? rejectionReason : null,
          reviewer: req.user.email
        }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `Document status changed to ${status}.`,
      document: updatedDoc
    });
  } catch (error) {
    console.error('Review document error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process document review.' });
  }
}

// 5. Delete Document
async function deleteDocument(req, res) {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: { employee: true }
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Only owner employee, HR, or Admin can delete
    const isOwner = req.user.employee?.id === document.employeeId;
    const isPrivileged = ['HR', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this document.' });
    }

    if (document.status === 'APPROVED' && !isPrivileged) {
      return res.status(400).json({
        success: false,
        message: 'Approved documents cannot be deleted. Contact HR for assistance.'
      });
    }

    // Delete disk file
    try {
      const diskPath = path.join(__dirname, '../../uploads/documents', document.storedFilename);
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    } catch (e) {
      console.error('Error removing file from disk:', e);
    }

    await prisma.document.delete({ where: { id } });

    if (document.onboardingId) {
      await recalculateProgress(document.onboardingId);
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DOCUMENT_DELETED',
        entity: 'DOCUMENT',
        entityId: id,
        details: JSON.stringify({ category: document.category, filename: document.originalFilename }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete document.' });
  }
}

module.exports = {
  getMyDocuments,
  getEmployeeDocuments,
  uploadDocument,
  reviewDocument,
  deleteDocument
};
