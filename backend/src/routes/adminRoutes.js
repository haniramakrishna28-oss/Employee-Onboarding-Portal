const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// Departments list is accessible to all authenticated users (e.g., HR creating candidates, employees viewing profile)
router.get('/departments', authenticateToken, adminController.getDepartments);

// All subsequent administrative actions require ADMIN role
router.use(authenticateToken, requireRole(['ADMIN']));

// User & Role Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);

// Departments modification
router.post('/departments', adminController.createDepartment);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
