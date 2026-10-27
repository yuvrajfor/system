const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/slotController');

router.use(authenticate);

// Publicly available to authenticated users (candidates & admins)
router.get('/available', controller.listAvailable);

// Restricted to admins
router.get('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.listAll);
router.post('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.create);
router.patch('/:id', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.update);
router.patch('/:id/cancel', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.cancel);
router.delete('/:id', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.cancel);

module.exports = router;
