const prisma = require('../config/prisma');

// Helper to recalculate onboarding progress
async function recalculateProgress(onboardingId) {
  if (!onboardingId) return;

  const [docs, checklists, tasks, approvals] = await Promise.all([
    prisma.document.findMany({ where: { onboardingId } }),
    prisma.checklistItem.findMany({ where: { onboardingId } }),
    prisma.task.findMany({ where: { onboardingId } }),
    prisma.approval.findMany({ where: { onboardingId } })
  ]);

  const approvedDocs = docs.filter(d => d.status === 'APPROVED').length;
  const docWeight = docs.length > 0 ? (approvedDocs / docs.length) * 35 : 0;

  const completedChecklists = checklists.filter(c => c.status === 'COMPLETED').length;
  const checklistWeight = checklists.length > 0 ? (completedChecklists / checklists.length) * 25 : 0;

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const taskWeight = tasks.length > 0 ? (completedTasks / tasks.length) * 20 : 0;

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

  await prisma.employee.update({
    where: { id: onboarding.employeeId },
    data: {
      progressPercentage: totalProgress,
      onboardingStatus: totalProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
    }
  });
}

// 1. Get current employee's active onboarding checklist
async function getMyChecklist(req, res) {
  try {
    const employee = req.user.employee;
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const onboarding = await prisma.onboarding.findFirst({
      where: {
        employeeId: employee.id,
        status: { not: 'COMPLETED' }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!onboarding) {
      // Look for latest completed if no active
      const latest = await prisma.onboarding.findFirst({
        where: { employeeId: employee.id },
        orderBy: { createdAt: 'desc' }
      });
      if (!latest) {
        return res.status(200).json({ success: true, checklist: [] });
      }
      const items = await prisma.checklistItem.findMany({
        where: { onboardingId: latest.id },
        orderBy: { createdAt: 'asc' }
      });
      return res.status(200).json({ success: true, checklist: items });
    }

    const items = await prisma.checklistItem.findMany({
      where: { onboardingId: onboarding.id },
      orderBy: { createdAt: 'asc' }
    });

    return res.status(200).json({
      success: true,
      onboardingId: onboarding.id,
      checklist: items
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve checklist.' });
  }
}

// 2. Update Checklist Item Status
async function updateChecklistItemStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING, IN_PROGRESS, COMPLETED

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid checklist item status.' });
    }

    const item = await prisma.checklistItem.findUnique({
      where: { id }
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Checklist item not found.' });
    }

    const isCompleted = status === 'COMPLETED';

    const updated = await prisma.checklistItem.update({
      where: { id },
      data: {
        status,
        completedAt: isCompleted ? new Date() : null,
        completedById: isCompleted ? req.user.id : null
      }
    });

    await recalculateProgress(item.onboardingId);

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'CHECKLIST_ITEM_UPDATED',
        entity: 'CHECKLIST_ITEM',
        entityId: id,
        details: JSON.stringify({ title: item.title, status }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `Checklist item updated to ${status}.`,
      item: updated
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return res.status(500).json({ success: false, message: 'Failed to update checklist item.' });
  }
}

// 3. Add Custom Checklist Item (HR or Admin)
async function addChecklistItem(req, res) {
  try {
    const { onboardingId, title, description, category, assignedRole } = req.body;

    if (!onboardingId || !title) {
      return res.status(400).json({ success: false, message: 'Onboarding ID and title are required.' });
    }

    const item = await prisma.checklistItem.create({
      data: {
        onboardingId,
        title: title.trim(),
        description: description ? description.trim() : null,
        category: category || 'HR_FORM',
        assignedRole: assignedRole || 'EMPLOYEE',
        status: 'PENDING'
      }
    });

    await recalculateProgress(onboardingId);

    return res.status(201).json({ success: true, item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create checklist item.' });
  }
}

module.exports = {
  getMyChecklist,
  updateChecklistItemStatus,
  addChecklistItem
};
