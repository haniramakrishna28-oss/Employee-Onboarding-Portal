const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole(['ADMIN']));

// User & Role Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);

// Departments
router.get('/departments', adminController.getDepartments);
router.post('/departments', adminController.createDepartment);

// Audit Logs
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
