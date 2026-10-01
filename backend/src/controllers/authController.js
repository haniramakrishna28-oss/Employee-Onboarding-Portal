const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Helper to validate password complexity
function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  return null;
}

// 1. Employee Registration
async function register(req, res) {
  try {
    const { email, password, firstName, lastName, phone, departmentId, designation } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, first name, and last name are required.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email address format.'
      });
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const employeeRole = await prisma.role.findUnique({ where: { name: 'EMPLOYEE' } });

    // Generate unique employee code
    const count = await prisma.employee.count();
    const employeeCode = `EMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'EMPLOYEE',
        roleId: employeeRole ? employeeRole.id : null,
        status: 'ACTIVE',
        employee: {
          create: {
            employeeCode,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : null,
            personalEmail: email.toLowerCase().trim(),
            departmentId: departmentId || null,
            designation: designation || 'New Associate',
            joiningDate: new Date(),
            onboardingStatus: 'IN_PROGRESS',
            progressPercentage: 0.0
          }
        }
      },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    // Auto-create initial onboarding for the registered employee with default template
    const defaultTemplate = await prisma.onboardingTemplate.findFirst({
      where: { isDefault: true }
    });

    if (defaultTemplate) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 14);

      const onboarding = await prisma.onboarding.create({
        data: {
          employeeId: user.employee.id,
          templateId: defaultTemplate.id,
          joiningDate: new Date(),
          deadline,
          status: 'IN_PROGRESS',
          currentStage: 'DOCUMENT_UPLOAD',
          overallProgress: 0.0
        }
      });

      // Parse and populate default checklist items
      if (defaultTemplate.defaultChecklist) {
        try {
          const checklist = JSON.parse(defaultTemplate.defaultChecklist);
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
          console.error('Error parsing default checklist:', e);
        }
      }

      // Populate approval gates
      await prisma.approval.createMany({
        data: [
          { onboardingId: onboarding.id, stage: 'HR_INITIAL_REVIEW', stepNumber: 1, approverRole: 'HR', status: 'PENDING' },
          { onboardingId: onboarding.id, stage: 'MANAGER_APPROVAL', stepNumber: 2, approverRole: 'MANAGER', status: 'PENDING' },
          { onboardingId: onboarding.id, stage: 'HR_FINAL_APPROVAL', stepNumber: 3, approverRole: 'HR', status: 'PENDING' }
        ]
      });

      // Create welcome notification
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to the Team!',
          message: 'Your onboarding profile has been created. Please complete your profile and upload compliance documents.',
          type: 'ACTION_REQUIRED',
          link: '/employee/onboarding'
        }
      });
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, employeeCode }),
        ipAddress: req.ip
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to the onboarding portal.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        employee: user.employee
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error processing registration.'
    });
  }
}

// 2. User Login
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        employee: {
          include: {
            department: true,
            reportingManager: {
              select: { id: true, firstName: true, lastName: true, employeeCode: true }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact HR or System Administrator.'
      });
    }

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email, role: user.role }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        employee: user.employee
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal error processing login.'
    });
  }
}

// 3. Get Current User Profile (Me)
async function getMe(req, res) {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching session user.'
    });
  }
}

// 4. Forgot Password (generates reset token)
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      // Return 200 to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If that email is registered in our portal, a password reset link has been dispatched.'
      });
    }

    // Generate random 64-character hex token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        ipAddress: req.ip
      }
    });

    // In local development, return the reset token directly so the user can test easily without SMTP
    return res.status(200).json({
      success: true,
      message: 'If that email is registered, a password reset token has been dispatched.',
      devResetToken: resetToken,
      devResetLink: `/reset-password?token=${resetToken}`
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating password reset token.'
    });
  }
}

// 5. Reset Password
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    const passwordError = validatePasswordStrength(newPassword);
    if (passwordError) {
      return res.status(400).json({ success: false, message: passwordError });
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token. Please request a new one.'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        entity: 'USER',
        entityId: user.id,
        details: JSON.stringify({ email: user.email }),
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error resetting password.'
    });
  }
}

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
};
