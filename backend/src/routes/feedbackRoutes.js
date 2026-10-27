const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/feedbackController');

router.use(authenticate);

// Candidate reads own feedback
router.get('/my', controller.myFeedback);

// Admin reads specific candidate's feedback (or candidate reads own)
router.get('/candidate/:candidateId', controller.candidateHistory);

// Only admins can submit feedback
router.post('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.submit);

module.exports = router;
