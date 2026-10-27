const jwt = require('jsonwebtoken');
const members = require('../repositories/memberRepository');
async function authenticate(req, res, next) { try { const token = req.headers.authorization?.replace(/^Bearer\s+/i, ''); if (!token) return res.status(401).json({ message: 'A sign-in token is required.' }); const payload = jwt.verify(token, process.env.JWT_SECRET); const user = await members.findByGoogleId(payload.googleId); if (!user) return res.status(401).json({ message: 'Account not found.' }); req.user = user; next(); } catch { res.status(401).json({ message: 'Your sign-in token is invalid or expired.' }); } }
function checkRole(roles) { return (req, res, next) => roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'You do not have access to this action.' }); }
module.exports = { authenticate, checkRole };
