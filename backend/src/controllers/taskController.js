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

// 1. Get current user's tasks
async function getMyTasks(req, res) {
  try {
    const employee = req.user.employee;
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assignedToId: req.user.id },
          { onboarding: { employeeId: employee.id } }
        ]
      },
      include: {
        createdBy: {
          select: { email: true, employee: { select: { firstName: true, lastName: true } } }
        },
        comments: {
          include: {
            user: {
              select: { email: true, employee: { select: { firstName: true, lastName: true } } }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve tasks.' });
  }
}

// 2. Create Task (HR or Manager)
async function createTask(req, res) {
  try {
    const { onboardingId, title, description, priority, deadline, assignedToId } = req.body;

    if (!onboardingId || !title) {
      return res.status(400).json({ success: false, message: 'Onboarding ID and task title are required.' });
    }

    const task = await prisma.task.create({
      data: {
        onboardingId,
        title: title.trim(),
        description: description ? description.trim() : null,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        assignedToId: assignedToId || null,
        createdById: req.user.id,
        status: 'TODO'
      },
      include: {
        createdBy: {
          select: { email: true, employee: { select: { firstName: true, lastName: true } } }
        }
      }
    });

    await recalculateProgress(onboardingId);

    // Notify assigned user if specified
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          userId: assignedToId,
          title: `New Task Assigned: ${task.title}`,
          message: `Priority: ${task.priority}. Deadline: ${task.deadline ? new Date(task.deadline).toLocaleDateString() : 'None set'}.`,
          type: 'INFO',
          link: '/employee/tasks'
        }
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'TASK_CREATED',
        entity: 'TASK',
        entityId: task.id,
        details: JSON.stringify({ title: task.title, priority: task.priority }),
        ipAddress: req.ip
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ success: false, message: 'Failed to create task.' });
  }
}

// 3. Update Task Status
async function updateTaskStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body; // TODO, IN_PROGRESS, COMPLETED

    const validStatuses = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid task status.' });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { status }
    });

    await recalculateProgress(task.onboardingId);

    return res.status(200).json({
      success: true,
      message: `Task marked as ${status}.`,
      task: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update task status.' });
  }
}

// 4. Add Comment to Task
async function addTaskComment(req, res) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Comment message is required.' });
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId: id,
        userId: req.user.id,
        message: message.trim()
      },
      include: {
        user: {
          select: { email: true, employee: { select: { firstName: true, lastName: true } } }
        }
      }
    });

    return res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add comment.' });
  }
}

module.exports = {
  getMyTasks,
  createTask,
  updateTaskStatus,
  addTaskComment
};
