const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Roles
  const rolesData = [
    { name: 'ADMIN', description: 'System Administrator with full management permissions' },
    { name: 'HR', description: 'HR Specialist managing onboardings, verification, and compliance' },
    { name: 'MANAGER', description: 'Department Manager reviewing team readiness and direct reports' },
    { name: 'EMPLOYEE', description: 'New joiner completing self-service onboarding' },
  ];

  const roles = {};
  for (const r of rolesData) {
    roles[r.name] = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  console.log('Seeded Roles: ADMIN, HR, MANAGER, EMPLOYEE');

  // 2. Departments
  const departmentsData = [
    { name: 'Engineering', code: 'ENG', description: 'Software engineering, cloud infrastructure, and technical architecture' },
    { name: 'Human Resources', code: 'HR', description: 'Talent acquisition, employee experience, and HR operations' },
    { name: 'Product & Design', code: 'PRD', description: 'Product management, user research, and UI/UX design' },
    { name: 'Sales & Marketing', code: 'MKT', description: 'Brand marketing, customer success, and revenue operations' },
  ];

  const departments = {};
  for (const d of departmentsData) {
    departments[d.code] = await prisma.department.upsert({
      where: { code: d.code },
      update: { description: d.description },
      create: d,
    });
  }
  console.log('Seeded Departments: ENG, HR, PRD, MKT');

  // 3. Password Hash for demo users
  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  // 4. Seed Admin
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@portal.test' },
    update: { passwordHash, role: 'ADMIN', roleId: roles.ADMIN.id },
    create: {
      email: 'admin@portal.test',
      passwordHash,
      role: 'ADMIN',
      roleId: roles.ADMIN.id,
      status: 'ACTIVE',
    },
  });

  await prisma.employee.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      employeeCode: 'EMP-ADM-001',
      firstName: 'Alex',
      lastName: 'Rivera',
      phone: '+1 (555) 100-0001',
      personalEmail: 'alex.rivera@example.com',
      dateOfBirth: new Date('1988-04-12'),
      gender: 'PREFER_NOT_TO_SAY',
      maritalStatus: 'SINGLE',
      bloodGroup: 'O+',
      designation: 'VP of Technology & Systems',
      departmentId: departments.ENG.id,
      joiningDate: new Date('2021-01-15'),
      onboardingStatus: 'COMPLETED',
      progressPercentage: 100.0,
      address: JSON.stringify({
        street: '100 Innovation Way',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'United States',
      }),
      emergencyContact: JSON.stringify({
        name: 'Maria Rivera',
        relation: 'Sister',
        phone: '+1 (555) 100-0002',
      }),
    },
  });

  // 5. Seed HR
  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@portal.test' },
    update: { passwordHash, role: 'HR', roleId: roles.HR.id },
    create: {
      email: 'hr@portal.test',
      passwordHash,
      role: 'HR',
      roleId: roles.HR.id,
      status: 'ACTIVE',
    },
  });

  await prisma.employee.upsert({
    where: { userId: hrUser.id },
    update: {},
    create: {
      userId: hrUser.id,
      employeeCode: 'EMP-HR-002',
      firstName: 'Hannah',
      lastName: 'Abbott',
      phone: '+1 (555) 200-0001',
      personalEmail: 'hannah.abbott@example.com',
      dateOfBirth: new Date('1992-08-23'),
      gender: 'FEMALE',
      maritalStatus: 'MARRIED',
      bloodGroup: 'A+',
      designation: 'Senior HR Operations Specialist',
      departmentId: departments.HR.id,
      joiningDate: new Date('2022-03-01'),
      onboardingStatus: 'COMPLETED',
      progressPercentage: 100.0,
      address: JSON.stringify({
        street: '250 Market Street',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94103',
        country: 'United States',
      }),
      emergencyContact: JSON.stringify({
        name: 'David Abbott',
        relation: 'Spouse',
        phone: '+1 (555) 200-0002',
      }),
    },
  });

  // 6. Seed Manager
  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@portal.test' },
    update: { passwordHash, role: 'MANAGER', roleId: roles.MANAGER.id },
    create: {
      email: 'manager@portal.test',
      passwordHash,
      role: 'MANAGER',
      roleId: roles.MANAGER.id,
      status: 'ACTIVE',
    },
  });

  const managerEmployee = await prisma.employee.upsert({
    where: { userId: managerUser.id },
    update: {},
    create: {
      userId: managerUser.id,
      employeeCode: 'EMP-MGR-003',
      firstName: 'Marcus',
      lastName: 'Vance',
      phone: '+1 (555) 300-0001',
      personalEmail: 'marcus.vance@example.com',
      dateOfBirth: new Date('1986-11-14'),
      gender: 'MALE',
      maritalStatus: 'MARRIED',
      bloodGroup: 'B+',
      designation: 'Engineering Manager',
      departmentId: departments.ENG.id,
      joiningDate: new Date('2021-06-15'),
      onboardingStatus: 'COMPLETED',
      progressPercentage: 100.0,
      address: JSON.stringify({
        street: '450 Pine Terrace',
        city: 'Oakland',
        state: 'CA',
        postalCode: '94607',
        country: 'United States',
      }),
      emergencyContact: JSON.stringify({
        name: 'Elena Vance',
        relation: 'Spouse',
        phone: '+1 (555) 300-0002',
      }),
    },
  });

  // 7. Seed Employee
  const employeeUser = await prisma.user.upsert({
    where: { email: 'employee@portal.test' },
    update: { passwordHash, role: 'EMPLOYEE', roleId: roles.EMPLOYEE.id },
    create: {
      email: 'employee@portal.test',
      passwordHash,
      role: 'EMPLOYEE',
      roleId: roles.EMPLOYEE.id,
      status: 'ACTIVE',
    },
  });

  const newJoinerEmployee = await prisma.employee.upsert({
    where: { userId: employeeUser.id },
    update: {},
    create: {
      userId: employeeUser.id,
      employeeCode: 'EMP-DEV-004',
      firstName: 'Emma',
      lastName: 'Watson',
      phone: '+1 (555) 400-0001',
      personalEmail: 'emma.watson@example.com',
      dateOfBirth: new Date('1998-09-19'),
      gender: 'FEMALE',
      maritalStatus: 'SINGLE',
      bloodGroup: 'O+',
      designation: 'Junior Full-Stack Engineer',
      departmentId: departments.ENG.id,
      reportingManagerId: managerEmployee.id,
      joiningDate: new Date(),
      onboardingStatus: 'IN_PROGRESS',
      progressPercentage: 25.0,
      address: JSON.stringify({
        street: '742 Evergreen Avenue',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94110',
        country: 'United States',
      }),
      emergencyContact: JSON.stringify({
        name: 'Robert Watson',
        relation: 'Father',
        phone: '+1 (555) 400-0002',
      }),
      education: JSON.stringify([
        { degree: 'B.S. in Computer Science', institution: 'University of California, Berkeley', year: '2022', grade: '3.8 GPA' }
      ]),
      previousExperience: JSON.stringify([
        { company: 'Acme Cloud Labs', designation: 'Software Intern', from: '2022', to: '2023' }
      ]),
    },
  });

  console.log('Seeded Users: admin@portal.test, hr@portal.test, manager@portal.test, employee@portal.test');

  // 8. Default Onboarding Template
  const defaultChecklistItems = [
    { title: 'Submit Government ID Proof (Passport / National ID)', category: 'DOCUMENT_SUBMISSION', assignedRole: 'EMPLOYEE', description: 'Upload verified photo ID in Documents tab' },
    { title: 'Submit Address Proof (Utility Bill / Lease)', category: 'DOCUMENT_SUBMISSION', assignedRole: 'EMPLOYEE', description: 'Upload recent utility bill or rental agreement' },
    { title: 'Fill Bank & Direct Deposit Details', category: 'BANK_DETAILS', assignedRole: 'EMPLOYEE', description: 'Provide Account Number and routing info in profile' },
    { title: 'Read & Sign Company Code of Conduct & NDA', category: 'POLICY_ACK', assignedRole: 'EMPLOYEE', description: 'Acknowledge organizational workplace compliance policy' },
    { title: 'Provision Laptop & Development Equipment', category: 'LAPTOP', assignedRole: 'IT', description: 'Order and configure development machine' },
    { title: 'Issue Corporate Email & SSO Credentials', category: 'IT_SETUP', assignedRole: 'IT', description: 'Create Google Workspace and internal Slack/GitHub accounts' },
    { title: 'Print & Issue Physical Office Badge', category: 'ID_CARD', assignedRole: 'HR', description: 'Security access card for headquarters building' },
    { title: 'Attend First Week HR Orientation Session', category: 'ORIENTATION', assignedRole: 'HR', description: 'Overview of benefits, payroll dates, and culture' }
  ];

  const defaultTasks = [
    { title: 'Complete Security & Data Privacy Training', priority: 'HIGH', description: 'Mandatory 45-minute information security video and quiz' },
    { title: 'Schedule 1-on-1 Introduction with Reporting Manager', priority: 'MEDIUM', description: 'Discuss team roadmap, first month expectations, and buddy pairing' },
    { title: 'Clone Repository and Set Up Local Development Environment', priority: 'HIGH', description: 'Follow README in engineering docs to setup tools, docker, and test suite' }
  ];

  let template = await prisma.onboardingTemplate.findFirst({
    where: { isDefault: true }
  });

  if (!template) {
    template = await prisma.onboardingTemplate.create({
      data: {
        title: 'Standard Full-Time Employee Onboarding',
        description: 'Comprehensive onboarding path covering compliance, IT setup, HR orientation, and team alignment.',
        departmentId: departments.ENG.id,
        isDefault: true,
        defaultChecklist: JSON.stringify(defaultChecklistItems),
        defaultTasks: JSON.stringify(defaultTasks),
      }
    });
  }

  console.log('Seeded Default Onboarding Template');

  // 9. Create Active Onboarding for Emma Watson
  let onboarding = await prisma.onboarding.findFirst({
    where: { employeeId: newJoinerEmployee.id }
  });

  if (!onboarding) {
    const today = new Date();
    const deadline = new Date();
    deadline.setDate(today.getDate() + 14);

    onboarding = await prisma.onboarding.create({
      data: {
        employeeId: newJoinerEmployee.id,
        templateId: template.id,
        managerId: managerEmployee.id,
        joiningDate: today,
        deadline: deadline,
        status: 'IN_PROGRESS',
        currentStage: 'DOCUMENT_UPLOAD',
        overallProgress: 25.0,
      }
    });

    // Seed checklist items for Emma's onboarding
    for (const item of defaultChecklistItems) {
      await prisma.checklistItem.create({
        data: {
          onboardingId: onboarding.id,
          title: item.title,
          category: item.category,
          assignedRole: item.assignedRole,
          description: item.description,
          status: item.category === 'BANK_DETAILS' ? 'COMPLETED' : 'PENDING',
          completedAt: item.category === 'BANK_DETAILS' ? new Date() : null,
          completedById: item.category === 'BANK_DETAILS' ? employeeUser.id : null,
        }
      });
    }

    // Seed tasks
    for (const task of defaultTasks) {
      const taskDeadline = new Date();
      taskDeadline.setDate(today.getDate() + 5);

      await prisma.task.create({
        data: {
          onboardingId: onboarding.id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          deadline: taskDeadline,
          status: 'TODO',
          assignedToId: employeeUser.id,
          createdById: hrUser.id,
        }
      });
    }

    // Seed approval pipeline stages
    await prisma.approval.createMany({
      data: [
        {
          onboardingId: onboarding.id,
          stage: 'HR_INITIAL_REVIEW',
          stepNumber: 1,
          approverRole: 'HR',
          status: 'PENDING',
        },
        {
          onboardingId: onboarding.id,
          stage: 'MANAGER_APPROVAL',
          stepNumber: 2,
          approverRole: 'MANAGER',
          status: 'PENDING',
        },
        {
          onboardingId: onboarding.id,
          stage: 'HR_FINAL_APPROVAL',
          stepNumber: 3,
          approverRole: 'HR',
          status: 'PENDING',
        },
      ]
    });

    // Create a welcome notification
    await prisma.notification.create({
      data: {
        userId: employeeUser.id,
        title: 'Welcome to the Team, Emma!',
        message: 'Your onboarding journey has begun. Please review your profile, upload your documents, and complete checklist items.',
        type: 'ACTION_REQUIRED',
        link: '/employee/onboarding',
      }
    });

    // Create an audit log
    await prisma.auditLog.create({
      data: {
        userId: hrUser.id,
        action: 'ONBOARDING_INITIALIZED',
        entity: 'ONBOARDING',
        entityId: onboarding.id,
        details: JSON.stringify({ employeeName: 'Emma Watson', template: template.title }),
      }
    });
  }

  console.log('Seeded Initial Onboarding Workflow for Emma Watson');
  console.log('--- Database Seeding Completed Successfully ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
