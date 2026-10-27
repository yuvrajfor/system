const GoogleStrategy = require('passport-google-oauth20').Strategy;
const members = require('../repositories/memberRepository');

function configure(passport) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientID || !clientSecret || clientID.includes('your-google-client-id')) {
    console.warn('⚠️  Real GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not configured.');
    console.warn('👉  Google OAuth will be available as soon as real credentials are added in .env.');
    console.warn('👉  Quick Demo logins are enabled on frontend and backend for testing.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL: `${process.env.BACKEND_URL || 'http://localhost:4000'}/api/auth/google/callback`,
      },
      async (_token, _refresh, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase();
          if (!email) {
            return done(new Error('Google did not supply an email address.'));
          }

          const isInitialAdmin =
            process.env.INITIAL_SUPER_ADMIN_EMAIL &&
            email === process.env.INITIAL_SUPER_ADMIN_EMAIL.toLowerCase();

          const user = await members.upsertGoogleUser({
            googleId: profile.id,
            email,
            name: profile.displayName || email.split('@')[0],
            ...(isInitialAdmin ? { role: 'SUPER_ADMIN' } : {}),
          });

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

module.exports = configure;
