require('dotenv').config({ path: '../.env.local' });
require('dotenv').config({ path: '.env' });
const express = require('express');
const http = require('http');

// Setup express app using existing server configuration
const app = express();
app.use(express.json());

const authRoutes = require('./src/routes/authRoutes');
const memberRoutes = require('./src/routes/memberRoutes');
const syndicateRoutes = require('./src/routes/syndicateRoutes');
const slotRoutes = require('./src/routes/slotRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');
const taskRoutes = require('./src/routes/taskRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/syndicates', syndicateRoutes);
app.use('/api/interview-slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/tasks', taskRoutes);

// Error handler
app.use((err, _req, res, _next) => {
  res.status(err.statusCode || 500).json({ message: err.message });
});

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(4099, resolve));
  const baseUrl = 'http://localhost:4099';

  console.log('🚀 Automated Test Server running on port 4099...');

  async function api(path, options = {}, token = null) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Login as Super Admin
    console.log('\n--- 1. Authentication & Role Logins ---');
    const adminLogin = await api('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role: 'SUPER_ADMIN' }),
    });
    assert(adminLogin.ok && adminLogin.data.token, 'Super Admin demo login succeeded');
    const adminToken = adminLogin.data.token;

    // 2. Login as Candidate Alex Rivera
    const candidateLogin = await api('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'candidate.demo@labsystem.org' }),
    });
    assert(candidateLogin.ok && candidateLogin.data.token, 'Candidate Alex demo login succeeded');
    const candidateToken = candidateLogin.data.token;
    const candidateId = candidateLogin.data.user.id;

    // 3. Login as Candidate Maya Lin
    const mayaLogin = await api('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ email: 'candidate.maya@labsystem.org' }),
    });
    assert(mayaLogin.ok && mayaLogin.data.token, 'Candidate Maya demo login succeeded');
    const mayaToken = mayaLogin.data.token;

    // 4. Admin creates interview slot
    console.log('\n--- 2. Interview Slot Creation & Validation ---');
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const startIso = new Date(tomorrow.setHours(15, 0, 0, 0)).toISOString();
    const endIso = new Date(tomorrow.setHours(16, 0, 0, 0)).toISOString();

    const createSlotRes = await api(
      '/api/interview-slots',
      {
        method: 'POST',
        body: JSON.stringify({
          title: 'Concurrency & Locking Technical Interview',
          startTime: startIso,
          endTime: endIso,
        }),
      },
      adminToken
    );
    assert(createSlotRes.status === 201 && createSlotRes.data.id, 'Admin successfully created interview slot');
    const createdSlotId = createSlotRes.data.id;

    // 5. Candidate tries to create a slot (must be rejected with 403)
    const candidateCreateRes = await api(
      '/api/interview-slots',
      {
        method: 'POST',
        body: JSON.stringify({
          title: 'Unauthorized Slot',
          startTime: startIso,
          endTime: endIso,
        }),
      },
      candidateToken
    );
    assert(candidateCreateRes.status === 403, 'Candidate cannot create slot (403 Forbidden enforced)');

    // 6. Candidate views available slots
    console.log('\n--- 3. Slot Viewing & Booking ---');
    const availableSlots = await api('/api/interview-slots/available', {}, candidateToken);
    assert(
      availableSlots.ok && Array.isArray(availableSlots.data) && availableSlots.data.some((s) => s.id === createdSlotId),
      'Candidate can view list of available future interview slots'
    );

    // 7. Candidate Alex books the slot
    const bookRes = await api(
      '/api/bookings',
      {
        method: 'POST',
        body: JSON.stringify({
          slotId: createdSlotId,
          notes: 'Interested in systems architecture and distributed state management.',
        }),
      },
      candidateToken
    );
    assert(bookRes.status === 201 && bookRes.data.booking.id, 'Candidate Alex booked the interview slot');
    const bookingId = bookRes.data.booking.id;

    // 8. DOUBLE-BOOKING PREVENTION TEST: Candidate Maya attempts to book the same slot
    console.log('\n--- 4. Concurrency & Double-Booking Prevention ---');
    const doubleBookRes = await api(
      '/api/bookings',
      {
        method: 'POST',
        body: JSON.stringify({
          slotId: createdSlotId,
          notes: 'Maya attempting to book the same slot.',
        }),
      },
      mayaToken
    );
    assert(
      doubleBookRes.status === 409,
      `Double-booking strictly rejected with 409 Conflict: "${doubleBookRes.data.message}"`
    );

    // 9. Feedback submission & Immutability
    console.log('\n--- 5. Evaluation Feedback & Privacy Isolation ---');
    const feedbackRes = await api(
      '/api/feedback',
      {
        method: 'POST',
        body: JSON.stringify({
          candidateId,
          slotId: createdSlotId,
          remarks: 'Exceptional problem-solving during database locking exercise.',
          strengths: 'Strong knowledge of ACID guarantees, optimistic locking, and indexing.',
          weaknesses: 'Could refine understanding of multi-region replication lag.',
          suggestions: 'Review Postgres read replica latency patterns and cross-region consensus.',
          rating: 5,
        }),
      },
      adminToken
    );
    assert(feedbackRes.status === 201 && feedbackRes.data.feedback.id, 'Super Admin submitted candidate feedback');

    // Candidate Maya tries to read Candidate Alex's feedback history (MUST BE 403)
    const unauthorizedFeedback = await api(
      `/api/feedback/candidate/${candidateId}`,
      {},
      mayaToken
    );
    assert(
      unauthorizedFeedback.status === 403,
      'Candidate Maya strictly forbidden from reading Candidate Alex feedback (403)'
    );

    // Candidate Alex reads own feedback history
    const alexFeedback = await api('/api/feedback/my', {}, candidateToken);
    assert(
      alexFeedback.ok && Array.isArray(alexFeedback.data) && alexFeedback.data.length > 0,
      'Candidate Alex successfully read own feedback history'
    );

    // 10. Improvement Tasks
    console.log('\n--- 6. Improvement Tasks Tracking & Privacy ---');
    const taskRes = await api(
      '/api/tasks',
      {
        method: 'POST',
        body: JSON.stringify({
          candidateId,
          slotId: createdSlotId,
          title: 'Benchmark read replica consistency in Neon',
          description: 'Measure replication lag across serverless connection pool.',
        }),
      },
      adminToken
    );
    assert(taskRes.status === 201 && taskRes.data.task.id, 'Admin assigned improvement task to candidate');
    const taskId = taskRes.data.task.id;

    // Maya tries to modify Alex's task (MUST BE 403)
    const mayaTaskUpdate = await api(
      `/api/tasks/${taskId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      },
      mayaToken
    );
    assert(mayaTaskUpdate.status === 403, 'Candidate Maya strictly forbidden from modifying Alex task (403)');

    // Alex updates own task status to IN_PROGRESS
    const alexTaskUpdate = await api(
      `/api/tasks/${taskId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      },
      candidateToken
    );
    assert(
      alexTaskUpdate.ok && alexTaskUpdate.data.task.status === 'IN_PROGRESS',
      'Candidate Alex successfully updated own task status to IN_PROGRESS'
    );

    // 11. Booking Cancellation
    console.log('\n--- 7. Booking Cancellation & Slot Re-opening ---');
    // Maya tries to cancel Alex's booking (MUST BE 403)
    const mayaCancel = await api(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' }, mayaToken);
    assert(mayaCancel.status === 403, 'Candidate Maya cannot cancel Candidate Alex booking (403)');

    // Alex cancels own booking
    const alexCancel = await api(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' }, candidateToken);
    assert(alexCancel.ok && alexCancel.data.booking.status === 'CANCELLED', 'Candidate Alex cancelled own booking');

    // Slot is reopened and available again
    const recheckSlot = await api('/api/interview-slots/available', {}, candidateToken);
    assert(
      recheckSlot.ok && recheckSlot.data.some((s) => s.id === createdSlotId),
      'Slot successfully reverted to AVAILABLE after booking cancellation'
    );

    console.log(`\n=========================================`);
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`=========================================\n`);
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
