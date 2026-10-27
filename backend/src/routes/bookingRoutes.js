const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/bookingController');

router.use(authenticate);

// Candidate routes
router.get('/my', controller.myBookings);
router.post('/', controller.book);
router.patch('/:id/cancel', controller.cancel);
router.delete('/:id', controller.cancel);

// Admin routes
router.get('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.listAll);

module.exports = router;
