const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklistController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/my', checklistController.getMyChecklist);
router.put('/:id/status', checklistController.updateChecklistItemStatus);
router.post('/add', requireRole(['HR', 'ADMIN']), checklistController.addChecklistItem);

module.exports = router;
