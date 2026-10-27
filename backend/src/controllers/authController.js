const jwt = require('jsonwebtoken');
const passport = require('passport');
const members = require('../repositories/memberRepository');

function startGoogleLogin(req, res, next) {
  if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID.includes('your-google-client-id')) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?open_google_modal=1`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
}

function googleCallback(req, res, next) {
  passport.authenticate('google', { session: false }, (error, user) => {
    if (error || !user) {
      console.error('Google OAuth callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google_sign_in_failed`);
    }

    const token = jwt.sign(
      { googleId: user.googleId, id: user.id, role: user.role },
      process.env.JWT_SECRET || 'lab_management_jwt_default_secret_key',
      { expiresIn: '7d' }
    );

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${encodeURIComponent(token)}`);
  })(req, res, next);
}

async function googleSignInCustom(req, res, next) {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && name.trim()) || cleanEmail.split('@')[0];
    const googleId = 'google-' + Buffer.from(cleanEmail).toString('hex').slice(0, 16);

    const isInitialAdmin =
      process.env.INITIAL_SUPER_ADMIN_EMAIL &&
      cleanEmail === process.env.INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();

    const user = await members.upsertGoogleUser({
      googleId,
      email: cleanEmail,
      name: cleanName,
      ...(isInitialAdmin ? { role: 'SUPER_ADMIN' } : {}),
    });

    const token = jwt.sign(
      { googleId: user.googleId, id: user.id, role: user.role },
      process.env.JWT_SECRET || 'lab_management_jwt_default_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

async function demoLogin(req, res, next) {
  try {
    const { role, email } = req.body;
    const allUsers = await members.findAll();

    let user;
    if (email) {
      user = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    } else if (role) {
      user = allUsers.find((u) => u.role === role);
    }

    if (!user) {
      return res.status(404).json({
        message: `No demo user found for role/email. Please ensure database is seeded.`
      });
    }

    const token = jwt.sign(
      { googleId: user.googleId, id: user.id, role: user.role },
      process.env.JWT_SECRET || 'lab_management_jwt_default_secret_key',
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

function currentUser(req, res) {
  res.json(req.user);
}

module.exports = {
  startGoogleLogin,
  googleCallback,
  googleSignInCustom,
  demoLogin,
  currentUser
};
