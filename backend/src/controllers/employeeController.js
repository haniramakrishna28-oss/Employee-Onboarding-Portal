const prisma = require('../config/prisma');

// 1. Get current logged-in employee profile
async function getMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const employee = await prisma.employee.findUnique({
      where: { userId },
      include: {
        department: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee profile associated with this account.'
      });
    }

    return res.status(200).json({
      success: true,
      profile: {
        ...employee,
        address: employee.address ? JSON.parse(employee.address) : {},
        emergencyContact: employee.emergencyContact ? JSON.parse(employee.emergencyContact) : {},
        education: employee.education ? JSON.parse(employee.education) : [],
        previousExperience: employee.previousExperience ? JSON.parse(employee.previousExperience) : []
      }
    });
  } catch (error) {
    console.error('Error fetching employee profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}

// 2. Update current logged-in employee profile
async function updateMyProfile(req, res) {
  try {
    const userId = req.user.id;
    const employee = await prisma.employee.findUnique({ where: { userId } });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found.' });
    }

    const {
      firstName,
      lastName,
      phone,
      personalEmail,
      dateOfBirth,
      gender,
      maritalStatus,
      bloodGroup,
      address,
      emergencyContact,
      education,
      previousExperience
    } = req.body;

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and last name are required.' });
    }

    if (personalEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(personalEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid personal email format.' });
      }
    }

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null,
        personalEmail: personalEmail ? personalEmail.trim() : null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        maritalStatus: maritalStatus || null,
        bloodGroup: bloodGroup || null,
        address: address ? JSON.stringify(address) : null,
        emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : null,
        education: education ? JSON.stringify(education) : null,
        previousExperience: previousExperience ? JSON.stringify(previousExperience) : null
      },
      include: {
        department: true,
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true }
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EMPLOYEE_PROFILE_UPDATED',
        entity: 'EMPLOYEE',
        entityId: employee.id,
        details: JSON.stringify({ updatedFields: Object.keys(req.body) }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      profile: {
        ...updated,
        address: updated.address ? JSON.parse(updated.address) : {},
        emergencyContact: updated.emergencyContact ? JSON.parse(updated.emergencyContact) : {},
        education: updated.education ? JSON.parse(updated.education) : [],
        previousExperience: updated.previousExperience ? JSON.parse(updated.previousExperience) : []
      }
    });
  } catch (error) {
    console.error('Error updating employee profile:', error);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
}

// 3. Get employee profile by ID (Admin, HR, or Manager)
async function getEmployeeById(req, res) {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        department: true,
        user: { select: { email: true, status: true, role: true } },
        reportingManager: {
          select: { id: true, firstName: true, lastName: true, employeeCode: true, designation: true }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    return res.status(200).json({
      success: true,
      profile: {
        ...employee,
        address: employee.address ? JSON.parse(employee.address) : {},
        emergencyContact: employee.emergencyContact ? JSON.parse(employee.emergencyContact) : {},
        education: employee.education ? JSON.parse(employee.education) : [],
        previousExperience: employee.previousExperience ? JSON.parse(employee.previousExperience) : []
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving employee profile.' });
  }
}

// 4. Update employee profile by ID (Admin or HR)
async function updateEmployeeById(req, res) {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      personalEmail,
      dateOfBirth,
      gender,
      maritalStatus,
      bloodGroup,
      designation,
      departmentId,
      reportingManagerId,
      joiningDate,
      address,
      emergencyContact,
      education,
      previousExperience
    } = req.body;

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        firstName: firstName ? firstName.trim() : undefined,
        lastName: lastName ? lastName.trim() : undefined,
        phone: phone !== undefined ? phone : undefined,
        personalEmail: personalEmail !== undefined ? personalEmail : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender: gender !== undefined ? gender : undefined,
        maritalStatus: maritalStatus !== undefined ? maritalStatus : undefined,
        bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
        designation: designation !== undefined ? designation : undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined,
        reportingManagerId: reportingManagerId !== undefined ? reportingManagerId : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        address: address ? JSON.stringify(address) : undefined,
        emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : undefined,
        education: education ? JSON.stringify(education) : undefined,
        previousExperience: previousExperience ? JSON.stringify(previousExperience) : undefined
      },
      include: {
        department: true,
        reportingManager: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: 'EMPLOYEE_ADMIN_UPDATED',
        entity: 'EMPLOYEE',
        entityId: id,
        details: JSON.stringify({ updatedBy: req.user.email, fields: Object.keys(req.body) }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      profile: updated
    });
  } catch (error) {
    console.error('Error updating employee by ID:', error);
    return res.status(500).json({ success: false, message: 'Failed to update employee.' });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
  getEmployeeById,
  updateEmployeeById
};
