const prisma = require('../config/prisma');

// 1. HR Dashboard Statistics
async function getHRStats(req, res) {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const now = new Date();

    const [
      totalEmployees,
      newJoiners,
      pendingOnboardings,
      completedOnboardings,
      pendingApprovals,
      pendingDocuments,
      overdueTasks
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({
        where: {
          joiningDate: { gte: thirtyDaysAgo }
        }
      }),
      prisma.onboarding.count({
        where: { status: { not: 'COMPLETED' } }
      }),
      prisma.onboarding.count({
        where: { status: 'COMPLETED' }
      }),
      prisma.approval.count({
        where: { status: 'PENDING' }
      }),
      prisma.document.count({
        where: { status: { in: ['PENDING', 'UPLOADED', 'UNDER_REVIEW'] } }
      }),
      prisma.task.count({
        where: {
          deadline: { lt: now },
          status: { not: 'COMPLETED' }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        newJoiners,
        pendingOnboardings,
        completedOnboardings,
        pendingApprovals,
        pendingDocuments,
        overdueTasks
      }
    });
  } catch (error) {
    console.error('Error fetching HR stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve HR statistics.' });
  }
}

// 2. HR Candidate Onboardings List (with search, filter, sort)
async function getHROnboardings(req, res) {
  try {
    const { search, departmentId, status, stage, sortBy = 'createdAt', order = 'desc' } = req.query;

    const where = {};
    if (status) where.status = status;
    if (stage) where.currentStage = stage;
    if (departmentId) {
      where.employee = { departmentId };
    }

    if (search) {
      where.OR = [
        { employee: { firstName: { contains: search } } },
        { employee: { lastName: { contains: search } } },
        { employee: { employeeCode: { contains: search } } },
        { employee: { user: { email: { contains: search } } } },
      ];
    }

    // Determine sorting
    let orderBy = {};
    if (sortBy === 'joiningDate') orderBy = { joiningDate: order };
    else if (sortBy === 'deadline') orderBy = { deadline: order };
    else if (sortBy === 'overallProgress') orderBy = { overallProgress: order };
    else orderBy = { createdAt: order };

    const onboardings = await prisma.onboarding.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
            reportingManager: {
              select: { id: true, firstName: true, lastName: true, employeeCode: true }
            },
            user: { select: { email: true, status: true } }
          }
        },
        template: { select: { id: true, title: true } },
        _count: {
          select: {
            documents: true,
            checklistItems: true,
            tasks: true,
            approvals: true
          }
        }
      },
      orderBy
    });

    return res.status(200).json({
      success: true,
      onboardings
    });
  } catch (error) {
    console.error('Error fetching onboardings:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve onboardings list.' });
  }
}

// 3. Create New Onboarding Workflow (Feature 8)
async function createOnboarding(req, res) {
  try {
    const {
      employeeId,
      departmentId,
      managerId,
      joiningDate,
      templateId,
      deadline
    } = req.body;

    if (!employeeId || !joiningDate || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Employee, joining date, and deadline are required.'
      });
    }

    // Verify employee exists and does not already have an active onboarding
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const existingActive = await prisma.onboarding.findFirst({
      where: {
        employeeId,
        status: { in: ['IN_PROGRESS', 'SUBMITTED', 'PENDING_APPROVAL'] }
      }
    });

    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: 'This employee already has an active onboarding underway.'
      });
    }

    // Update employee's department, manager, and joining date if provided
    await prisma.employee.update({
      where: { id: employeeId },
      data: {
        departmentId: departmentId || employee.departmentId,
        reportingManagerId: managerId || employee.reportingManagerId,
        joiningDate: new Date(joiningDate),
        onboardingStatus: 'IN_PROGRESS',
        progressPercentage: 0.0
      }
    });

    // Get selected or default template
    let template = null;
    if (templateId) {
      template = await prisma.onboardingTemplate.findUnique({ where: { id: templateId } });
    }
    if (!template) {
      template = await prisma.onboardingTemplate.findFirst({ where: { isDefault: true } });
    }

    // Create Onboarding record
    const onboarding = await prisma.onboarding.create({
      data: {
        employeeId,
        templateId: template ? template.id : null,
        managerId: managerId || employee.reportingManagerId,
        joiningDate: new Date(joiningDate),
        deadline: new Date(deadline),
        status: 'IN_PROGRESS',
        currentStage: 'DOCUMENT_UPLOAD',
        overallProgress: 0.0
      }
    });

    // Instantiate Checklist Items from template
    if (template && template.defaultChecklist) {
      try {
        const checklist = JSON.parse(template.defaultChecklist);
        for (const item of checklist) {
          await prisma.checklistItem.create({
            data: {
              onboardingId: onboarding.id,
              title: item.title,
              category: item.category || 'DOCUMENT_SUBMISSION',
              assignedRole: item.assignedRole || 'EMPLOYEE',
              description: item.description || null,
              status: 'PENDING'
            }
          });
        }
      } catch (e) {
        console.error('Error instantiating checklist:', e);
      }
    }

    // Instantiate Tasks from template
    if (template && template.defaultTasks) {
      try {
        const tasks = JSON.parse(template.defaultTasks);
        for (const task of tasks) {
          const taskDeadline = new Date(joiningDate);
          taskDeadline.setDate(taskDeadline.getDate() + 5);

          await prisma.task.create({
            data: {
              onboardingId: onboarding.id,
              title: task.title,
              description: task.description || null,
              priority: task.priority || 'MEDIUM',
              deadline: taskDeadline,
              status: 'TODO',
              assignedToId: employee.userId,
              createdById: req.user.id
            }
          });
        }
      } catch (e) {
        console.error('Error instantiating tasks:', e);
      }
    }

    // Instantiate sequential Approval gates
    await prisma.approval.createMany({
      data: [
        { onboardingId: onboarding.id, stage: 'HR_INITIAL_REVIEW', stepNumber: 1, approverRole: 'HR', status: 'PENDING' },
        { onboardingId: onboarding.id, stage: 'MANAGER_APPROVAL', stepNumber: 2, approverRole: 'MANAGER', status: 'PENDING' },
        { onboardingId: onboarding.id, stage: 'HR_FINAL_APPROVAL', stepNumber: 3, approverRole: 'HR', status: 'PENDING' }
      ]
    });

    // Create notifications for Employee and Manager
    await prisma.notification.create({
      data: {
        userId: employee.userId,
        title: 'New Onboarding Assigned!',
        message: 'Your onboarding workspace has been configured. Start by reviewing your profile and uploading compliance documents.',
        type: 'ACTION_REQUIRED',
        link: '/employee/dashboard'
      }
    });

    if (managerId) {
      const managerEmp = await prisma.employee.findUnique({ where: { id: managerId } });
      if (managerEmp) {
        await prisma.notification.create({
          data: {
            userId: managerEmp.userId,
            title: `New Team Joiner: ${employee.firstName} ${employee.lastName}`,
            message: `${employee.firstName} has joined your department and started onboarding.`,
            type: 'INFO',
            link: '/manager/dashboard'
          }
        });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'ONBOARDING_CREATED',
        entity: 'ONBOARDING',
        entityId: onboarding.id,
        details: JSON.stringify({
          employeeName: `${employee.firstName} ${employee.lastName}`,
          templateTitle: template?.title,
          deadline
        }),
        ipAddress: req.ip
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Onboarding initialized successfully!',
      onboarding
    });
  } catch (error) {
    console.error('Error creating onboarding:', error);
    return res.status(500).json({ success: false, message: 'Failed to create onboarding.' });
  }
}

// 4. Get Templates list for HR wizard
async function getTemplates(req, res) {
  try {
    const templates = await prisma.onboardingTemplate.findMany({
      include: { department: true }
    });
    return res.status(200).json({ success: true, templates });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch templates.' });
  }
}

// 5. Get Managers list for selection
async function getManagers(req, res) {
  try {
    const managers = await prisma.employee.findMany({
      where: {
        user: { role: { in: ['MANAGER', 'ADMIN'] } }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        designation: true,
        department: { select: { id: true, name: true } }
      },
      orderBy: { firstName: 'asc' }
    });
    return res.status(200).json({ success: true, managers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch managers.' });
  }
}

// 6. Get Employees available for new onboarding
async function getAvailableEmployees(req, res) {
  try {
    // Return all employees without an active onboarding
    const employees = await prisma.employee.findMany({
      where: {
        onboardings: {
          none: {
            status: { in: ['IN_PROGRESS', 'SUBMITTED', 'PENDING_APPROVAL'] }
          }
        }
      },
      include: {
        department: true,
        user: { select: { email: true } }
      },
      orderBy: { firstName: 'asc' }
    });
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch available employees.' });
  }
}

module.exports = {
  getHRStats,
  getHROnboardings,
  createOnboarding,
  getTemplates,
  getManagers,
  getAvailableEmployees
};
