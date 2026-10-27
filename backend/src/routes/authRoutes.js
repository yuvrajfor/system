const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/authController');

router.get('/google', controller.startGoogleLogin);
router.get('/google/callback', controller.googleCallback);
router.post('/google-sign-in', controller.googleSignInCustom);
router.post('/demo-login', controller.demoLogin);
router.get('/me', authenticate, controller.currentUser);

module.exports = router;
