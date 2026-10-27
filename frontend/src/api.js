const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const token = localStorage.getItem('lab_token');
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }
  return data;
}

async function loginAsDemoRole(role, email) {
  const res = await request('/api/auth/demo-login', {
    method: 'POST',
    body: JSON.stringify({ role, email }),
  });
  if (res.token) {
    localStorage.setItem('lab_token', res.token);
  }
  return res.user;
}

async function customGoogleLogin(email, name) {
  const res = await request('/api/auth/google-sign-in', {
    method: 'POST',
    body: JSON.stringify({ email, name }),
  });
  if (res.token) {
    localStorage.setItem('lab_token', res.token);
  }
  return res.user;
}

// Interview Slots API
const slotsApi = {
  getAvailable: () => request('/api/interview-slots/available'),
  getAll: (params = '') => request(`/api/interview-slots${params}`),
  create: (data) => request('/api/interview-slots', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/interview-slots/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  cancel: (id) => request(`/api/interview-slots/${id}/cancel`, { method: 'PATCH' }),
};

// Bookings API
const bookingsApi = {
  getMy: () => request('/api/bookings/my'),
  getAll: () => request('/api/bookings'),
  book: (slotId, notes) => request('/api/bookings', { method: 'POST', body: JSON.stringify({ slotId, notes }) }),
  cancel: (id) => request(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
};

// Feedback API
const feedbackApi = {
  getMy: () => request('/api/feedback/my'),
  getCandidateHistory: (candidateId) => request(`/api/feedback/candidate/${candidateId}`),
  submit: (data) => request('/api/feedback', { method: 'POST', body: JSON.stringify(data) }),
};

// Improvement Tasks API
const tasksApi = {
  getMy: () => request('/api/tasks/my'),
  getCandidateTasks: (candidateId) => request(`/api/tasks/candidate/${candidateId}`),
  updateStatus: (id, status) => request(`/api/tasks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  create: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
};

// Candidates & Members API
const candidatesApi = {
  list: () => request('/api/members/candidates'),
};

export {
  apiUrl,
  request,
  loginAsDemoRole,
  customGoogleLogin,
  slotsApi,
  bookingsApi,
  feedbackApi,
  tasksApi,
  candidatesApi,
};
