const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/memberController');

router.use(authenticate);

// List candidates for admin review
router.get('/candidates', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.listCandidates);

router.get('/', checkRole(['SUPER_ADMIN', 'SYNDICATE_LEAD']), controller.list);
router.patch('/:id/role', checkRole(['SUPER_ADMIN']), controller.updateRole);

module.exports = router;
