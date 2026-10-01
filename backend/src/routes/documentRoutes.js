const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const upload = require('../config/multer');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

// Employee document self-service
router.get('/my', documentController.getMyDocuments);
router.post('/upload', upload.single('file'), documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);

// HR, Manager, Admin view & review
router.get('/employee/:employeeId', requireRole(['HR', 'MANAGER', 'ADMIN']), documentController.getEmployeeDocuments);
router.post('/:id/review', requireRole(['HR', 'ADMIN']), documentController.reviewDocument);

module.exports = router;
