const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { authenticateToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(authenticateToken);

router.get('/my', taskController.getMyTasks);
router.post('/create', requireRole(['HR', 'MANAGER', 'ADMIN']), taskController.createTask);
router.put('/:id/status', taskController.updateTaskStatus);
router.post('/:id/comments', taskController.addTaskComment);

module.exports = router;
