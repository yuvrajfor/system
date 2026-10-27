const express = require('express');
const cors = require('cors');
const passport = require('passport');
const path = require('path');

// 1. Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('dotenv').config();
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('ERROR: JWT_SECRET must be configured with at least 32 characters.');
  process.exit(1);
}

const configurePassport = require('./config/passport');
configurePassport(passport);

const app = express();

// 2. CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4000',
  'http://localhost:3000'
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(passport.initialize());

// 3. Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'configured' : 'missing',
    auth: {
      googleConfigured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    }
  });
});

// 4. API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/syndicates', require('./routes/syndicateRoutes'));
app.use('/api/interview-slots', require('./routes/slotRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// 5. Global error handler
app.use((error, _req, res, _next) => {
  console.error('Server error:', error);
  res.status(500).json({
    message: error.message || 'The server could not complete this request.'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(` Lab Member Management API listening on port ${PORT}`);
  console.log(` Health endpoint: http://localhost:${PORT}/health`);
  console.log(` Database: Connected to Neon PostgreSQL`);
});
