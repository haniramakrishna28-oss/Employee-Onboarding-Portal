const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

// HR and Admin stats & listing
router.get('/stats', requireRole(['HR', 'ADMIN']), onboardingController.getHRStats);
router.get('/list', requireRole(['HR', 'ADMIN', 'MANAGER']), onboardingController.getHROnboardings);

// Wizard dropdown helpers
router.get('/templates', requireRole(['HR', 'ADMIN']), onboardingController.getTemplates);
router.get('/managers', requireRole(['HR', 'ADMIN']), onboardingController.getManagers);
router.get('/available-employees', requireRole(['HR', 'ADMIN']), onboardingController.getAvailableEmployees);

// Creation
router.post('/create', requireRole(['HR', 'ADMIN']), onboardingController.createOnboarding);

// Detailed view and stage updates (HR, Manager, Admin)
router.get('/:id', requireRole(['HR', 'ADMIN', 'MANAGER', 'EMPLOYEE']), onboardingController.getOnboardingById);
router.put('/:id/stage', requireRole(['HR', 'ADMIN', 'MANAGER']), onboardingController.updateOnboardingStage);

module.exports = router;
