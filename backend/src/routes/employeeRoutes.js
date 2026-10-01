const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

// All employee routes require authentication
router.use(authenticateToken);

// Current user profile
router.get('/me', employeeController.getMyProfile);
router.put('/me', employeeController.updateMyProfile);

// Admin, HR, Manager routes
router.get('/:id', requireRole(['ADMIN', 'HR', 'MANAGER']), employeeController.getEmployeeById);
router.put('/:id', requireRole(['ADMIN', 'HR']), employeeController.updateEmployeeById);

module.exports = router;
