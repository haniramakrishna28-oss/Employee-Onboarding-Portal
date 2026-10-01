const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

// HR and Admin stats & listing
router.get('/stats', requireRole(['HR', 'ADMIN']), onboardingController.getHRStats);
router.get('/list', requireRole(['HR', 'ADMIN']), onboardingController.getHROnboardings);

// Wizard dropdown helpers
router.get('/templates', requireRole(['HR', 'ADMIN']), onboardingController.getTemplates);
router.get('/managers', requireRole(['HR', 'ADMIN']), onboardingController.getManagers);
router.get('/available-employees', requireRole(['HR', 'ADMIN']), onboardingController.getAvailableEmployees);

// Creation
router.post('/create', requireRole(['HR', 'ADMIN']), onboardingController.createOnboarding);

module.exports = router;
