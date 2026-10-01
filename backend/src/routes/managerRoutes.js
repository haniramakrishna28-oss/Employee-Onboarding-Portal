const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken, requireRole(['MANAGER', 'ADMIN']));

router.get('/direct-reports', managerController.getDirectReports);

module.exports = router;
