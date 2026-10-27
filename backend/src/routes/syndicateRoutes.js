const router = require('express').Router();
const { authenticate, checkRole } = require('../middleware/auth');
const controller = require('../controllers/syndicateController');

router.use(authenticate);

// All authenticated members can view the list of syndicates and individual syndicate details
router.get('/', controller.list);
router.get('/:id', controller.getOne);

// Syndicate modification CRUD: restricted strictly to SUPER_ADMIN
router.post('/', checkRole(['SUPER_ADMIN']), controller.create);
router.patch('/:id', checkRole(['SUPER_ADMIN']), controller.update);
router.delete('/:id', checkRole(['SUPER_ADMIN']), controller.remove);

module.exports = router;
