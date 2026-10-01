const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  const counts = {
    users: await prisma.user.count(),
    employees: await prisma.employee.count(),
    departments: await prisma.department.count(),
    roles: await prisma.role.count(),
    templates: await prisma.onboardingTemplate.count(),
    onboardings: await prisma.onboarding.count(),
    checklists: await prisma.checklistItem.count(),
    tasks: await prisma.task.count(),
    approvals: await prisma.approval.count(),
    notifications: await prisma.notification.count(),
    auditLogs: await prisma.auditLog.count()
  };

  console.log('--- DATABASE VERIFICATION COUNTS ---');
  console.table(counts);

  const demoUsers = await prisma.user.findMany({
    select: { email: true, role: true, employee: { select: { firstName: true, lastName: true, employeeCode: true } } }
  });
  console.log('Demo Users:', JSON.stringify(demoUsers, null, 2));

  await prisma.$disconnect();
}

verify().catch(console.error);
