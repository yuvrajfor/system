const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/taskController');

router.use(authenticate);

// Candidate routes
router.get('/my', controller.myTasks);
router.patch('/:id/status', controller.updateStatus);

// Admin routes
router.get('/candidate/:candidateId', controller.candidateTasks);
router.post('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.create);

module.exports = router;
