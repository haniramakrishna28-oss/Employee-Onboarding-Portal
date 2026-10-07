const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

// 1. Get all users (searchable, filterable)
async function getUsers(req, res) {
  try {
    const { search, role, status } = req.query;

    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search && search.trim()) {
      const terms = search.trim().split(/\s+/).filter(Boolean);
      where.AND = terms.map(term => ({
        OR: [
          { email: { contains: term } },
          { employee: { firstName: { contains: term } } },
          { employee: { lastName: { contains: term } } },
          { employee: { employeeCode: { contains: term } } },
        ]
      }));
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        employee: {
          include: {
            department: true,
            reportingManager: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedUsers = users.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      employee: u.employee
    }));

    return res.status(200).json({
      success: true,
      users: sanitizedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users.' });
  }
}

// 2. Update user role
async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    // Safety: Prevent admin from demoting their own account
    if (req.user.id === id && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: 'Cannot revoke your own Administrator role.'
      });
    }

    const roleObj = await prisma.role.findUnique({ where: { name: role } });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
        roleId: roleObj ? roleObj.id : null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_ROLE_UPDATED',
        entity: 'USER',
        entityId: id,
        details: JSON.stringify({ updatedRole: role }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      user: { id: updatedUser.id, role: updatedUser.role }
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user role.' });
  }
}

// 3. Update user status (Active / Inactive)
async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACTIVE or INACTIVE.' });
    }

    // Safety: Prevent admin from deactivating self
    if (req.user.id === id && status === 'INACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own active admin account.'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_STATUS_UPDATED',
        entity: 'USER',
        entityId: id,
        details: JSON.stringify({ updatedStatus: status }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      user: { id: updatedUser.id, status: updatedUser.status }
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
}

// 4. Create new user by Admin
async function createUser(req, res) {
  try {
    const { email, password, role, firstName, lastName, departmentId, designation } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, last name, and role are required.'
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const roleObj = await prisma.role.findUnique({ where: { name: role } });

    const count = await prisma.employee.count();
    const employeeCode = `EMP-SYS-${String(count + 1).padStart(4, '0')}`;

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role,
        roleId: roleObj ? roleObj.id : null,
        status: 'ACTIVE',
        employee: {
          create: {
            employeeCode,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            departmentId: departmentId || null,
            designation: designation || 'Staff Member',
            joiningDate: new Date(),
            onboardingStatus: 'IN_PROGRESS',
            progressPercentage: 0.0
          }
        }
      },
      include: {
        employee: { include: { department: true } }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_CREATED_BY_ADMIN',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role }),
        ipAddress: req.ip
      }
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: { id: user.id, email: user.email, role: user.role, employee: user.employee }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
}

// 5. Department Management
async function getDepartments(req, res) {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
}

async function createDepartment(req, res) {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and unique code are required.' });
    }

    const dept = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description ? description.trim() : null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DEPARTMENT_CREATED',
        entity: 'DEPARTMENT',
        entityId: dept.id,
        details: JSON.stringify({ name: dept.name, code: dept.code }),
        ipAddress: req.ip
      }
    });

    return res.status(201).json({ success: true, department: dept });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A department with this name or code already exists.' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
}

async function updateDepartment(req, res) {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const data = {};
    if (name) data.name = name.trim();
    if (code) data.code = code.toUpperCase().trim();
    if (description !== undefined) data.description = description ? description.trim() : null;

    const updated = await prisma.department.update({
      where: { id },
      data
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DEPARTMENT_UPDATED',
        entity: 'DEPARTMENT',
        entityId: id,
        details: JSON.stringify({ name: updated.name, code: updated.code }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department: updated
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ success: false, message: 'A department with this name or code already exists.' });
    }
    console.error('Error updating department:', error);
    return res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
}

async function deleteDepartment(req, res) {
  try {
    const { id } = req.params;

    const dept = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { employees: true, templates: true }
        }
      }
    });

    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    // AC: Deleted departments with assigned employees cannot be hard-deleted; system displays an explanatory warning.
    if (dept._count.employees > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department "${dept.name}" because it currently has ${dept._count.employees} assigned employee(s). Please reassign them first.`
      });
    }

    // Disconnect templates referencing this department
    if (dept._count.templates > 0) {
      await prisma.onboardingTemplate.updateMany({
        where: { departmentId: id },
        data: { departmentId: null }
      });
    }

    await prisma.department.delete({
      where: { id }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'DEPARTMENT_DELETED',
        entity: 'DEPARTMENT',
        entityId: id,
        details: JSON.stringify({ name: dept.name, code: dept.code }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `Department "${dept.name}" (${dept.code}) deleted successfully.`
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
}

// 6. Audit Logs
async function getAuditLogs(req, res) {
  try {
    const { limit = 50, action } = req.query;
    const where = {};
    if (action) where.action = action;

    const logs = await prisma.auditLog.findMany({
      where,
      take: parseInt(limit),
      include: {
        user: {
          select: {
            email: true,
            role: true,
            employee: { select: { firstName: true, lastName: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus,
  createUser,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAuditLogs
};
