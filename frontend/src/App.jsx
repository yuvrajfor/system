import React, { useEffect, useState, useMemo } from 'react';
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  LogIn,
  Users,
  ShieldCheck,
  UserCircle,
  AlertTriangle,
  Cpu,
  Layers,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Shield,
  Activity,
  Boxes,
  Database,
  X,
  Sparkles,
  Mail,
  Search,
  Bell,
  Sliders,
  ChevronRight,
  Filter,
  BarChart3,
  Check,
  Key,
  Globe,
  Lock,
  ExternalLink,
  Calendar,
  Clock,
  Star,
  ListTodo,
  Award,
  AlertCircle,
  CalendarCheck,
  CalendarX,
  MessageSquare,
  FileText
} from 'lucide-react';
import {
  apiUrl,
  request,
  loginAsDemoRole,
  customGoogleLogin,
  slotsApi,
  bookingsApi,
  feedbackApi,
  tasksApi,
  candidatesApi
} from './api';

// ==========================================
// TOAST NOTIFICATION COMPONENT
// ==========================================
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === 'error'
      ? 'bg-rose-950/90 border-rose-800 text-rose-200'
      : 'bg-emerald-950/90 border-emerald-800 text-emerald-200';

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm transition-all animate-bounce ${bg}`}
    >
      {type === 'error' ? (
        <AlertTriangle size={18} className="text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      )}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75">
        <X size={15} />
      </button>
    </div>
  );
}

// ==========================================
// ROLE BADGE COMPONENT
// ==========================================
function RoleBadge({ role }) {
  const styles = {
    SUPER_ADMIN: 'bg-purple-950/80 text-purple-300 border-purple-700/60 shadow-purple-900/30',
    SYNDICATE_LEAD: 'bg-sky-950/80 text-sky-300 border-sky-700/60 shadow-sky-900/30',
    MEMBER: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-emerald-900/30',
    GUEST: 'bg-amber-950/80 text-amber-300 border-amber-700/60 shadow-amber-900/30',
    CANDIDATE: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60 shadow-cyan-900/30',
  };
  const label = role ? role.replace('_', ' ') : 'GUEST';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-sm ${
        styles[role] || 'bg-slate-900 text-slate-300 border-slate-700'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {label}
    </span>
  );
}

// ==========================================
// AVATAR COMPONENT WITH INITIALS
// ==========================================
function Avatar({ name, size = 'md' }) {
  const initials = (name || 'U')
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizeClass =
    size === 'lg' ? 'w-12 h-12 text-base' : size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-xs';

  return (
    <div
      className={`${sizeClass} rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20 shrink-0`}
    >
      {initials}
    </div>
  );
}

// ==========================================
// RATING STARS COMPONENT
// ==========================================
function RatingStars({ rating = 5, max = 5, onChange = null }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => {
        const starNum = i + 1;
        const filled = starNum <= rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            onClick={() => onChange && onChange(starNum)}
            className={`${onChange ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}`}
          >
            <Star
              size={16}
              className={filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
            />
          </button>
        );
      })}
    </div>
  );
}

// ==========================================
// LOGIN SCREEN (SAAS SPLIT-SCREEN)
// ==========================================
function Login({ onLoginSuccess }) {
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState('');
  const [googleModal, setGoogleModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [submittingCustom, setSubmittingCustom] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('open_google_modal') === '1') {
      setGoogleModal(true);
    }
    if (searchParams.get('error')) {
      setError('Google Sign-in was cancelled or encountered an error. Try Instant Demo Login.');
    }
  }, [searchParams]);

  async function handleDemoLogin(role, email) {
    try {
      setLoadingRole(role || email);
      setError('');
      const user = await loginAsDemoRole(role, email);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Demo sign-in failed');
    } finally {
      setLoadingRole(null);
    }
  }

  async function handleCustomGoogleSubmit(e) {
    e.preventDefault();
    if (!customEmail) return;
    try {
      setSubmittingCustom(true);
      setError('');
      const user = await customGoogleLogin(customEmail, customName);
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Sign-in failed');
    } finally {
      setSubmittingCustom(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Background Glow */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Left Column: Platform Branding */}
      <div className="lg:w-7/12 p-8 lg:p-16 flex flex-col justify-between z-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-950/40 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Boxes size={22} />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white">CORTEX</span>
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/50 text-indigo-400 font-mono">
                LABS
              </span>
            </div>
          </div>

          <div className="mt-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-indigo-400 font-medium mb-4">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Interview Orchestration & Evaluation Engine</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              Syndicate Recruitment & Candidate Growth Platform
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              Super Admin interview scheduling, conflict-free atomic candidate booking, immutable evaluation feedback, and actionable improvement task tracking.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-lg">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-2xl font-black text-white">100%</span>
              <p className="text-xs text-slate-400 mt-0.5">Atomic Anti-Conflict</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-2xl font-black text-indigo-400">Immutable</span>
              <p className="text-xs text-slate-400 mt-0.5">Feedback History</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <span className="text-2xl font-black text-emerald-400">RBAC</span>
              <p className="text-xs text-slate-400 mt-0.5">PostgreSQL & Neon</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Database size={14} className="text-emerald-400" /> Neon PostgreSQL
          </span>
          <span className="flex items-center gap-1.5">
            <Lock size={14} className="text-indigo-400" /> Signed JWT Sessions
          </span>
          <span>© 2026 Cortex Labs</span>
        </div>
      </div>

      {/* Right Column: Instant Role Access & Google Login */}
      <div className="lg:w-5/12 p-6 lg:p-12 flex items-center justify-center z-10">
        <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/80 border border-slate-800/90 shadow-2xl backdrop-blur-2xl">
          <div className="text-left mb-6">
            <h2 className="text-2xl font-bold text-white tracking-tight">Access Platform</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select an account role below to instantly launch the respective panel
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TWO PRIMARY REQUIRED PANELS */}
          <div className="space-y-3 mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Primary System Panels
            </p>

            {/* SUPER ADMIN PANEL */}
            <button
              onClick={() => handleDemoLogin('SUPER_ADMIN')}
              disabled={loadingRole !== null}
              className="w-full p-4 text-left rounded-2xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-700/60 hover:border-purple-500 transition shadow-lg shadow-purple-950/30 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-lg">
                  👑
                </div>
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    Super Admin Panel
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/80 text-purple-300 font-mono">
                      Syndicate Admin
                    </span>
                  </span>
                  <p className="text-xs text-purple-200/70 mt-0.5">
                    Dr. Elena Rostova • Slots, Scheduling, Feedback & Tasks
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-purple-400 group-hover:translate-x-1 transition" />
            </button>

            {/* CANDIDATE PANEL */}
            <button
              onClick={() => handleDemoLogin('CANDIDATE', 'candidate.demo@labsystem.org')}
              disabled={loadingRole !== null}
              className="w-full p-4 text-left rounded-2xl bg-cyan-950/30 hover:bg-cyan-900/40 border border-cyan-700/60 hover:border-cyan-500 transition shadow-lg shadow-cyan-950/30 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-cyan-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-lg">
                  🎓
                </div>
                <div>
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    Candidate Panel
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-300 font-mono">
                      Applicant
                    </span>
                  </span>
                  <p className="text-xs text-cyan-200/70 mt-0.5">
                    Alex Rivera • Browse Slots, Bookings, Feedback & Tasks
                  </p>
                </div>
              </div>
              <ChevronRight size={18} className="text-cyan-400 group-hover:translate-x-1 transition" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-500">
              <span className="bg-slate-900 px-3">Other Demo Roles & Google Auth</span>
            </div>
          </div>

          {/* Secondary Quick Logins */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => handleDemoLogin('SYNDICATE_LEAD')}
              disabled={loadingRole !== null}
              className="p-2.5 text-left rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs transition"
            >
              <span className="font-semibold text-sky-400 block">🛡️ Syndicate Lead</span>
              <span className="text-[10px] text-slate-400">Aria Chen</span>
            </button>
            <button
              onClick={() => handleDemoLogin('CANDIDATE', 'candidate.maya@labsystem.org')}
              disabled={loadingRole !== null}
              className="p-2.5 text-left rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-xs transition"
            >
              <span className="font-semibold text-cyan-400 block">👩‍💻 Candidate 2</span>
              <span className="text-[10px] text-slate-400">Maya Lin (Privacy Test)</span>
            </button>
          </div>

          {/* Google OAuth Modal Button */}
          <button
            onClick={() => setGoogleModal(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <Mail size={15} />
            <span>Sign in with Google Credentials</span>
          </button>
        </div>
      </div>

      {/* Google Account Modal */}
      {googleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400">
                <LogIn size={22} />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Google Sign-In</h3>
                <p className="text-xs text-slate-400">Enter your Gmail to authenticate into Cortex</p>
              </div>
            </div>

            <form onSubmit={handleCustomGoogleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Google Email Address
                </label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="e.g. yuvrajsingh@gmail.com"
                  className="w-full text-sm rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Yuvraj Singh"
                  className="w-full text-sm rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submittingCustom || !customEmail}
                className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {submittingCustom ? 'Signing In...' : 'Continue to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

// ==========================================
// CALLBACK HANDLER
// ==========================================
function Callback({ onLoginSuccess }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      localStorage.setItem('lab_token', token);
      request('/api/auth/me')
        .then((user) => {
          onLoginSuccess(user);
          navigate('/', { replace: true });
        })
        .catch(() => navigate('/login?error=token_failed', { replace: true }));
    } else {
      navigate('/login', { replace: true });
    }
  }, [params, navigate, onLoginSuccess]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Validating security credentials...</span>
      </div>
    </div>
  );
}

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================
function Sidebar({ user, activeTab, setActiveTab, onLogout }) {
  const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(user.role);

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Boxes size={18} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">CORTEX LABS</span>
            <span className="block text-[10px] text-indigo-400 font-mono">
              {isAdmin ? 'ADMIN CONTROL' : 'CANDIDATE PORTAL'}
            </span>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/70 flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="mt-5 space-y-1">
          {isAdmin ? (
            // ================= ADMIN TABS =================
            <>
              <button
                onClick={() => setActiveTab('slots')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'slots'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Calendar size={16} />
                <span>Interview Slots</span>
              </button>

              <button
                onClick={() => setActiveTab('candidates')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'candidates'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Users size={16} />
                <span>Candidates & Feedback</span>
              </button>

              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <BarChart3 size={16} />
                <span>Overview & Metrics</span>
              </button>

              <button
                onClick={() => setActiveTab('syndicates')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'syndicates'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Layers size={16} />
                <span>Syndicates & Quotas</span>
              </button>
            </>
          ) : (
            // ================= CANDIDATE TABS =================
            <>
              <button
                onClick={() => setActiveTab('available-slots')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'available-slots'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Calendar size={16} />
                <span>Available Slots</span>
              </button>

              <button
                onClick={() => setActiveTab('my-bookings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'my-bookings'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <CalendarCheck size={16} />
                <span>My Interviews</span>
              </button>

              <button
                onClick={() => setActiveTab('my-feedback')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'my-feedback'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Award size={16} />
                <span>Feedback & Reviews</span>
              </button>

              <button
                onClick={() => setActiveTab('my-tasks')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'my-tasks'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <ListTodo size={16} />
                <span>Improvement Tasks</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <UserCircle size={16} />
            <span>My Profile</span>
          </button>
        </nav>
      </div>

      {/* Footer Info & Sign out */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="px-2 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Neon PostgreSQL
          </span>
          <span className="font-mono">Port 443 WS</span>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// ADMIN TAB: INTERVIEW SLOTS MANAGER
// ==========================================
function AdminSlotsTab({ showToast }) {
  const [slots, setSlots] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('Technical Interview & Code Review');
  const [slotDate, setSlotDate] = useState(() => {
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [startTimeStr, setStartTimeStr] = useState('14:00');
  const [endTimeStr, setEndTimeStr] = useState('15:00');

  function loadSlots() {
    setLoading(true);
    slotsApi
      .getAll()
      .then(setSlots)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSlots();
  }, []);

  async function handleCreateSlot(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const startDateTime = new Date(`${slotDate}T${startTimeStr}:00`);
      const endDateTime = new Date(`${slotDate}T${endTimeStr}:00`);

      if (startDateTime >= endDateTime) {
        showToast('Start time must be before end time.', 'error');
        return;
      }
      if (startDateTime < new Date()) {
        showToast('Slot cannot be scheduled in the past.', 'error');
        return;
      }

      await slotsApi.create({
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      showToast('Interview slot successfully created!', 'success');
      setShowModal(false);
      loadSlots();
    } catch (err) {
      showToast(err.message || 'Failed to create slot', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancelSlot(id) {
    if (!window.confirm('Are you sure you want to cancel this interview slot?')) return;
    try {
      await slotsApi.cancel(id);
      showToast('Interview slot cancelled.', 'success');
      loadSlots();
    } catch (err) {
      showToast(err.message || 'Failed to cancel slot', 'error');
    }
  }

  const filteredSlots = useMemo(() => {
    if (filter === 'ALL') return slots;
    return slots.filter((s) => s.status === filter);
  }, [slots, filter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-indigo-400" size={20} />
            Interview Slots Management
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Create, schedule, and oversee technical interview availability for candidates
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
        >
          <Plus size={16} />
          <span>Create Interview Slot</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium mr-2">Filter Status:</span>
        {['ALL', 'AVAILABLE', 'BOOKED', 'CANCELLED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f} {f === 'ALL' ? `(${slots.length})` : `(${slots.filter((s) => s.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Slots List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading interview slots...</span>
        </div>
      ) : filteredSlots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Calendar className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">No interview slots found</p>
          <p className="text-xs text-slate-500 mt-1">
            Create a slot above to allow candidates to book interview sessions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSlots.map((slot) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            const isBooked = slot.status === 'BOOKED' && slot.booking;

            return (
              <div
                key={slot.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white line-clamp-1">{slot.title}</span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase shrink-0 ${
                        slot.status === 'AVAILABLE'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : slot.status === 'BOOKED'
                          ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-3 text-xs text-slate-300">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-indigo-400" />
                      {start.toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={14} className="text-slate-500" />
                      {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isBooked && (
                    <div className="mt-4 p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 text-xs">
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                        Booked Candidate
                      </span>
                      <p className="font-bold text-white mt-0.5">{slot.booking.candidate.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {slot.booking.candidate.email}
                      </p>
                      {slot.booking.notes && (
                        <p className="text-[11px] text-slate-300 mt-1 italic">
                          "{slot.booking.notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Host: {slot.admin?.name || 'Super Admin'}
                  </span>
                  {slot.status === 'AVAILABLE' && (
                    <button
                      onClick={() => handleCancelSlot(slot.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Cancel Slot</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE SLOT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Calendar size={18} className="text-indigo-400" />
              <span>Create Interview Slot</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Open an interview session window for candidate booking
            </p>

            <form onSubmit={handleCreateSlot} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Interview Topic / Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems & Concurrency Audit"
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Interview Date</label>
                <input
                  type="date"
                  required
                  value={slotDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTimeStr}
                    onChange={(e) => setStartTimeStr(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTimeStr}
                    onChange={(e) => setEndTimeStr(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Publish Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// ADMIN TAB: CANDIDATES & FEEDBACK EVALUATION
// ==========================================
function AdminCandidatesTab({ showToast }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Feedback History Modal
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateFeedback, setCandidateFeedback] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Submit Feedback Modal
  const [evaluatingCandidate, setEvaluatingCandidate] = useState(null);
  const [rating, setRating] = useState(5);
  const [remarks, setRemarks] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [assignTask, setAssignTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDays, setTaskDueDays] = useState('7');
  const [submittingEval, setSubmittingEval] = useState(false);

  function loadCandidates() {
    setLoading(true);
    candidatesApi
      .list()
      .then(setCandidates)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadCandidates();
  }, []);

  async function openHistoryModal(candidate) {
    setSelectedCandidate(candidate);
    setLoadingHistory(true);
    try {
      const history = await feedbackApi.getCandidateHistory(candidate.id);
      setCandidateFeedback(history);
    } catch (err) {
      showToast(err.message || 'Failed to load feedback history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  }

  function openEvaluateModal(candidate) {
    setEvaluatingCandidate(candidate);
    setRating(5);
    setRemarks('');
    setStrengths('');
    setWeaknesses('');
    setSuggestions('');
    setAssignTask(false);
    setTaskTitle('');
    setTaskDueDays('7');
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (!evaluatingCandidate) return;

    try {
      setSubmittingEval(true);
      await feedbackApi.submit({
        candidateId: evaluatingCandidate.id,
        remarks,
        strengths,
        weaknesses,
        suggestions,
        rating,
      });

      if (assignTask && taskTitle.trim()) {
        const dueDate = new Date(Date.now() + parseInt(taskDueDays, 10) * 24 * 60 * 60 * 1000);
        await tasksApi.create({
          candidateId: evaluatingCandidate.id,
          title: taskTitle.trim(),
          description: `Action item assigned from interview evaluation: ${suggestions.slice(0, 80)}...`,
          dueDate: dueDate.toISOString(),
        });
      }

      showToast('Candidate evaluation & feedback recorded successfully!', 'success');
      setEvaluatingCandidate(null);
      loadCandidates();
    } catch (err) {
      showToast(err.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingEval(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [candidates, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-indigo-400" size={20} />
            Candidates Roster & Feedback History
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review applicant candidates, view full historical evaluation feedback, and submit structured assessments
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-2.5 text-slate-500" size={15} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate name or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Candidate List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading candidates...</span>
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Users className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">No candidates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="md" />
                    <div>
                      <h3 className="font-bold text-sm text-white">{c.name}</h3>
                      <p className="text-[11px] text-slate-400 font-mono">{c.email}</p>
                    </div>
                  </div>
                  <RoleBadge role={c.role} />
                </div>

                {/* Metrics Badges */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-sm font-black text-indigo-400 font-mono">
                      {c._count?.bookings || 0}
                    </span>
                    <p className="text-[10px] text-slate-400">Interviews</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {c._count?.receivedFeedbacks || 0}
                    </span>
                    <p className="text-[10px] text-slate-400">Reviews</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-sm font-black text-purple-400 font-mono">
                      {c._count?.improvementTasks || 0}
                    </span>
                    <p className="text-[10px] text-slate-400">Tasks</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => openHistoryModal(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <FileText size={13} />
                  <span>View History</span>
                </button>
                <button
                  onClick={() => openEvaluateModal(c)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  <Award size={13} />
                  <span>Evaluate Candidate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FULL FEEDBACK HISTORY MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <Avatar name={selectedCandidate.name} size="md" />
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{selectedCandidate.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    Immutable Feedback History
                  </span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">{selectedCandidate.email}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingHistory ? (
                <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading history...</span>
                </div>
              ) : candidateFeedback.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-slate-400 text-xs">
                  No evaluation records submitted yet for this candidate.
                </div>
              ) : (
                candidateFeedback.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={fb.rating} />
                        <span className="text-slate-400 text-[11px] font-mono">
                          • Evaluated by {fb.admin?.name || 'Super Admin'}
                        </span>
                      </div>
                      <span className="text-slate-500 font-mono text-[10px]">
                        {new Date(fb.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Remarks
                      </span>
                      <p className="text-slate-200 leading-relaxed">{fb.remarks}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                        <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">
                          Strengths
                        </span>
                        <p className="text-slate-300">{fb.strengths}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40">
                        <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1">
                          Areas for Improvement
                        </span>
                        <p className="text-slate-300">{fb.weaknesses}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-950/20 border border-indigo-900/40">
                      <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1">
                        Actionable Suggestions
                      </span>
                      <p className="text-slate-300">{fb.suggestions}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATION SUBMISSION MODAL */}
      {evaluatingCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEvaluatingCandidate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Award size={18} className="text-indigo-400" />
              <span>Evaluate Candidate: {evaluatingCandidate.name}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Submit structured, immutable evaluation feedback and assign improvement tasks
            </p>

            <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Performance Rating</label>
                <div className="flex items-center gap-3">
                  <RatingStars rating={rating} onChange={setRating} />
                  <span className="text-slate-400 font-mono text-xs">({rating} of 5 Stars)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Overall Interview Remarks *
                </label>
                <textarea
                  required
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Summary of technical interview performance..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Observed Strengths *</label>
                <textarea
                  required
                  rows={2}
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Key technical, architectural, and analytical strengths..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Weaknesses / Areas for Improvement *
                </label>
                <textarea
                  required
                  rows={2}
                  value={weaknesses}
                  onChange={(e) => setWeaknesses(e.target.value)}
                  placeholder="Gaps in knowledge, implementation flaws, or missing edge cases..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Actionable Improvement Suggestions *
                </label>
                <textarea
                  required
                  rows={2}
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Concrete steps, papers, or exercises the candidate should complete..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Optional Task Assignment */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-indigo-300">
                  <input
                    type="checkbox"
                    checked={assignTask}
                    onChange={(e) => setAssignTask(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Assign an actionable improvement task directly to candidate</span>
                </label>

                {assignTask && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Task Title</label>
                      <input
                        type="text"
                        required={assignTask}
                        value={taskTitle}
                        onChange={(e) => setTaskTitle(e.target.value)}
                        placeholder="e.g. Implement distributed rate limiter with Redis and sliding window"
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Due In (Days)</label>
                      <select
                        value={taskDueDays}
                        onChange={(e) => setTaskDueDays(e.target.value)}
                        className="w-full rounded-xl bg-slate-900 border border-slate-700 text-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="3">3 Days</option>
                        <option value="7">7 Days (1 Week)</option>
                        <option value="14">14 Days (2 Weeks)</option>
                        <option value="30">30 Days (1 Month)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEvaluatingCandidate(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEval}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {submittingEval ? 'Saving Evaluation...' : 'Submit Immutable Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CANDIDATE TAB: AVAILABLE INTERVIEW SLOTS
// ==========================================
function CandidateAvailableSlotsTab({ showToast, onBookSuccess }) {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [booking, setBooking] = useState(false);

  function loadAvailable() {
    setLoading(true);
    slotsApi
      .getAvailable()
      .then(setSlots)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAvailable();
  }, []);

  async function handleBookConfirm(e) {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      setBooking(true);
      await bookingsApi.book(selectedSlot.id, notes);
      showToast('Interview slot successfully booked!', 'success');
      setSelectedSlot(null);
      setNotes('');
      loadAvailable();
      if (onBookSuccess) onBookSuccess();
    } catch (err) {
      showToast(err.message || 'Failed to book slot. It may have just been taken.', 'error');
      loadAvailable();
    } finally {
      setBooking(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="text-cyan-400" size={20} />
            Available Interview Slots
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Browse upcoming open interview sessions and reserve your spot
          </p>
        </div>

        <button
          onClick={loadAvailable}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
        >
          Refresh Open Slots
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Searching available slots...</span>
        </div>
      ) : slots.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <CalendarX className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">No open slots available right now</p>
          <p className="text-xs text-slate-500 mt-1">
            Our administrators open new interview windows frequently. Please check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.map((slot) => {
            const start = new Date(slot.startTime);
            const end = new Date(slot.endTime);
            const durationMin = Math.round((end.getTime() - start.getTime()) / (60 * 1000));

            return (
              <div
                key={slot.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-600/50 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">{slot.title}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 uppercase shrink-0">
                      OPEN
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-cyan-400 shrink-0" />
                      <span>
                        {start.toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={14} className="text-slate-500 shrink-0" />
                      <span>
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                        {durationMin} mins)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Host Evaluator:</span>
                    <span className="font-semibold text-white">
                      {slot.admin?.name || 'Super Admin'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedSlot(slot);
                      setNotes('');
                    }}
                    className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition flex items-center justify-center gap-1.5"
                  >
                    <CalendarCheck size={14} />
                    <span>Book This Interview Slot</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BOOKING CONFIRMATION MODAL */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedSlot(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>

            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <CalendarCheck size={18} className="text-cyan-400" />
              <span>Confirm Interview Booking</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedSlot.title}</p>

            <form onSubmit={handleBookConfirm} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
                  Scheduled Time
                </span>
                <p className="font-semibold text-white">
                  {new Date(selectedSlot.startTime).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-[11px] text-slate-400">
                  Host: {selectedSlot.admin?.name || 'Super Admin'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Candidate Notes / Research Interests (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Interested in distributed systems, backend engineering, or machine learning..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 rounded-xl font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  className="px-4 py-2 rounded-xl font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition disabled:opacity-50"
                >
                  {booking ? 'Securing Slot...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// CANDIDATE TAB: MY BOOKINGS & SCHEDULE
// ==========================================
function CandidateBookingsTab({ showToast, onNavigateSlots }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadMyBookings() {
    setLoading(true);
    bookingsApi
      .getMy()
      .then(setBookings)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMyBookings();
  }, []);

  async function handleCancel(id) {
    if (!window.confirm('Are you sure you want to cancel your booked interview? The slot will reopen for others.')) {
      return;
    }
    try {
      await bookingsApi.cancel(id);
      showToast('Booking cancelled successfully.', 'success');
      loadMyBookings();
    } catch (err) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="text-indigo-400" size={20} />
            My Booked Interviews
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track your confirmed interview sessions and manage upcoming bookings
          </p>
        </div>

        <button
          onClick={onNavigateSlots}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
        >
          <Plus size={16} />
          <span>Book Another Slot</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading your bookings...</span>
        </div>
      ) : bookings.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <Calendar className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">You have no booked interviews</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Browse available slots to schedule your technical interview.
          </p>
          <button
            onClick={onNavigateSlots}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-600/30 transition inline-flex items-center gap-2"
          >
            <span>View Available Slots</span>
            <ChevronRight size={14} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookings.map((b) => {
            const start = b.slot ? new Date(b.slot.startTime) : null;
            const end = b.slot ? new Date(b.slot.endTime) : null;
            const isConfirmed = b.status === 'CONFIRMED';

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-bold text-white">
                      {b.slot?.title || 'Technical Assessment'}
                    </span>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase shrink-0 ${
                        isConfirmed
                          ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                          : b.status === 'COMPLETED'
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                          : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {start && (
                    <div className="mt-3 space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-indigo-400" />
                        <span>
                          {start.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock size={14} className="text-slate-500" />
                        <span>
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                    <p>
                      Host:{' '}
                      <strong className="text-slate-200">
                        {b.slot?.admin?.name || 'Super Admin'}
                      </strong>
                    </p>
                    {b.notes && (
                      <p className="mt-1 text-slate-400 italic">Notes: "{b.notes}"</p>
                    )}
                  </div>
                </div>

                {isConfirmed && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Trash2 size={13} />
                      <span>Cancel Booking</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CANDIDATE TAB: MY FEEDBACK & EVALUATIONS
// ==========================================
function CandidateFeedbackTab({ showToast }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    feedbackApi
      .getMy()
      .then(setFeedbackList)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="text-indigo-400" size={20} />
          My Interview Feedback & Growth History
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Review immutable evaluation remarks, strengths, weaknesses, and improvement roadmaps from syndicate interviewers
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading feedback records...</span>
        </div>
      ) : feedbackList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <MessageSquare className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">No interview feedback received yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Once you attend an interview, your evaluator's remarks, strengths, and suggestions will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedbackList.map((fb) => (
            <div
              key={fb.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 text-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <RatingStars rating={fb.rating} />
                  <span className="font-semibold text-white">
                    {fb.slot?.title || 'Technical Assessment'}
                  </span>
                </div>
                <div className="text-slate-400 text-[11px] font-mono">
                  Evaluated by <strong className="text-slate-300">{fb.admin?.name || 'Super Admin'}</strong> on{' '}
                  {new Date(fb.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Evaluator Remarks
                </span>
                <p className="text-slate-200 text-sm leading-relaxed">{fb.remarks}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 size={13} />
                    <span>Key Strengths</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{fb.strengths}</p>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40">
                  <span className="text-[10px] font-bold uppercase text-amber-400 block mb-1.5 flex items-center gap-1.5">
                    <AlertTriangle size={13} />
                    <span>Areas for Improvement</span>
                  </span>
                  <p className="text-slate-300 leading-relaxed">{fb.weaknesses}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40">
                <span className="text-[10px] font-bold uppercase text-indigo-400 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles size={13} />
                  <span>Actionable Improvement Suggestions</span>
                </span>
                <p className="text-slate-300 leading-relaxed">{fb.suggestions}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CANDIDATE TAB: IMPROVEMENT TASKS TRACKER
// ==========================================
function CandidateTasksTab({ showToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  function loadTasks() {
    setLoading(true);
    tasksApi
      .getMy()
      .then(setTasks)
      .catch((err) => showToast(err.message, 'error'))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleStatusChange(taskId, newStatus) {
    try {
      await tasksApi.updateStatus(taskId, newStatus);
      showToast(`Task marked as ${newStatus}!`, 'success');
      loadTasks();
    } catch (err) {
      showToast(err.message || 'Failed to update task status', 'error');
    }
  }

  const completedCount = useMemo(
    () => tasks.filter((t) => t.status === 'COMPLETED').length,
    [tasks]
  );
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = useMemo(() => {
    if (filter === 'ALL') return tasks;
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  return (
    <div className="space-y-6">
      {/* Header & Progress Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ListTodo className="text-indigo-400" size={20} />
              Actionable Improvement Tasks
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Personalized action items and growth roadmap assigned by your evaluators
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Completion Rate</span>
            <p className="text-xl font-black text-white font-mono">
              {completedCount} / {tasks.length} ({progressPercent}%)
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === f
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {f} {f === 'ALL' ? `(${tasks.length})` : `(${tasks.filter((t) => t.status === f).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading tasks...</span>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800/80">
          <ListTodo className="mx-auto text-slate-600 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-300">No tasks in this category</p>
          <p className="text-xs text-slate-500 mt-1">
            Improvement tasks will appear here as interviewers review your sessions.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white text-sm">{task.title}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border uppercase ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-sky-950/80 text-sky-300 border-sky-700/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-700/60'
                    }`}
                  >
                    {task.status.replace('_', ' ')}
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{task.description}</p>
                )}

                {task.dueDate && (
                  <p className="text-[11px] text-slate-500 font-mono pt-1">
                    Due by:{' '}
                    {new Date(task.dueDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Status Switcher Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {task.status !== 'IN_PROGRESS' && task.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-sky-300 bg-sky-950/60 hover:bg-sky-900/60 border border-sky-800/60 transition"
                  >
                    Start Task
                  </button>
                )}
                {task.status !== 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <Check size={14} />
                    <span>Mark Done</span>
                  </button>
                )}
                {task.status === 'COMPLETED' && (
                  <button
                    onClick={() => handleStatusChange(task.id, 'PENDING')}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAB: OVERVIEW & ANALYTICS (EXISTING PRESERVED)
// ==========================================
function OverviewTab({ user, members, syndicates, onNavigateTab }) {
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isLead = user.role === 'SYNDICATE_LEAD';

  const totalTokens = useMemo(() => {
    return syndicates.reduce((acc, s) => acc + (s.resourcesAllocated || 0), 0);
  }, [syndicates]);

  const pendingGuests = useMemo(() => {
    return members.filter((m) => m.role === 'GUEST').length;
  }, [members]);

  return (
    <div className="space-y-6">
      {isLead && user.syndicate && (
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-r from-sky-950/80 via-indigo-950/70 to-slate-900 border border-sky-800/50 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">
                Assigned Guild Command
              </span>
              <h2 className="text-2xl font-black text-white mt-1">{user.syndicate.name}</h2>
              <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
                {user.syndicate.description}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Compute Tokens</span>
                <span className="text-xl font-black text-sky-300 font-mono">
                  {user.syndicate.resourcesAllocated}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Personnel</span>
            <Users size={16} className="text-indigo-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{members.length}</p>
          <span className="text-[11px] text-emerald-400 font-medium">● Verified across all guilds</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Active Syndicates</span>
            <Boxes size={16} className="text-sky-400" />
          </div>
          <p className="text-2xl font-black text-white mt-2">{syndicates.length}</p>
          <span className="text-[11px] text-slate-400 font-medium">Autonomous Research Units</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Allocated Tokens</span>
            <Cpu size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-black text-purple-300 mt-2 font-mono">
            {totalTokens.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400 font-medium">Compute quota in pool</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Awaiting Approval</span>
            <AlertTriangle size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2">{pendingGuests}</p>
          <span className="text-[11px] text-amber-400/80 font-medium">Pending Guest accounts</span>
        </div>
      </div>

      {/* Syndicates Distribution */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Syndicate Compute Distributions</h3>
            <p className="text-xs text-slate-400">Current resource allocation per lab guild</p>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => onNavigateTab('syndicates')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Manage Syndicates <ArrowRight size={13} />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {syndicates.map((s) => {
            const pct = totalTokens > 0 ? Math.round((s.resourcesAllocated / totalTokens) * 100) : 0;
            return (
              <div
                key={s.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    <span className="text-xs font-mono font-semibold text-indigo-400">
                      {s.resourcesAllocated} tokens ({pct}%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                </div>
                <div className="mt-3">
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{s._count?.members ?? 0} Personnel</span>
                    <span>Status: Active</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAB: SYNDICATES & QUOTAS (EXISTING PRESERVED)
// ==========================================
function SyndicatesTab({ syndicates, onRefresh, showToast }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreate(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      setSubmitting(true);
      await request('/api/syndicates', {
        method: 'POST',
        body: JSON.stringify({
          name: data.get('name'),
          description: data.get('description'),
          resourcesAllocated: Number(data.get('resourcesAllocated')) || 0,
        }),
      });
      showToast('New Syndicate successfully provisioned!', 'success');
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      showToast(err.message || 'Creation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id, name) {
    if (window.confirm(`Are you sure you want to decommission syndicate "${name}"?`)) {
      try {
        await request(`/api/syndicates/${id}`, { method: 'DELETE' });
        showToast(`Syndicate "${name}" deleted.`, 'success');
        onRefresh();
      } catch (err) {
        showToast(err.message || 'Delete failed', 'error');
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Syndicate Guilds & Token Quotas</h2>
          <p className="text-xs text-slate-400">
            Define research syndicate domains, governance boundaries, and compute budgets
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition"
        >
          <Plus size={16} />
          <span>Provision Syndicate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {syndicates.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950 border border-indigo-700/50 text-indigo-400">
                    <Boxes size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{s.name}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {s.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(s.id, s.name)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                  title="Decommission Syndicate"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">{s.description}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-purple-400 font-mono font-bold">
                <Cpu size={14} /> {s.resourcesAllocated} Tokens
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users size={14} /> {s._count?.members ?? 0} Personnel
              </span>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Plus size={18} className="text-indigo-400" />
              <span>Provision Research Syndicate</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">Registers a new syndicate node in PostgreSQL</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Syndicate Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Distributed Neural Systems"
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mission / Description
                </label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  placeholder="Core research domain and directives..."
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Compute Tokens Budget
                </label>
                <input
                  name="resourcesAllocated"
                  type="number"
                  min="0"
                  defaultValue="2000"
                  required
                  className="w-full text-xs rounded-xl bg-slate-950 border border-slate-700 text-white px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {submitting ? 'Provisioning...' : 'Provision Syndicate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAB: MY PROFILE (EXISTING PRESERVED)
// ==========================================
function ProfileTab({ user }) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} size="lg" />
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>
          <RoleBadge role={user.role} />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
              Assigned Syndicate
            </span>
            <span className="text-sm font-bold text-white mt-1 block">
              {user.syndicate?.name || <span className="text-slate-500 italic">Unassigned</span>}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
              User UUID
            </span>
            <span className="text-xs font-mono text-slate-300 mt-1 block truncate">{user.id}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
              Registration Date
            </span>
            <span className="text-xs text-slate-300 mt-1 block">
              {new Date(user.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[10px] text-slate-500 uppercase font-mono font-bold block">
              Security Mechanism
            </span>
            <span className="text-xs text-emerald-400 mt-1 block font-mono">
              Google OAuth 2.0 + HS256 JWT
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
function Dashboard({ user, onLogout }) {
  const isAdmin = ['SUPER_ADMIN', 'SYNDICATE_LEAD'].includes(user.role);

  // Default active tab based on role
  const [activeTab, setActiveTab] = useState(() => (isAdmin ? 'slots' : 'available-slots'));
  const [members, setMembers] = useState([]);
  const [syndicates, setSyndicates] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  function loadOverviewData() {
    if (isAdmin) {
      request('/api/members')
        .then(setMembers)
        .catch(() => setMembers([]));
      request('/api/syndicates')
        .then(setSyndicates)
        .catch(() => setSyndicates([]));
    }
  }

  useEffect(() => {
    loadOverviewData();
  }, [user]);

  return (
    <div className="min-h-screen flex bg-slate-950 font-sans text-slate-100">
      {/* Sidebar */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800/80 px-8 flex items-center justify-between bg-slate-950/70 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Cortex</span>
            <span className="text-slate-600">/</span>
            <span className="text-white font-semibold capitalize">
              {activeTab.replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>

            <div className="flex items-center gap-3">
              <Avatar name={user.name} size="sm" />
              <div className="hidden md:block text-left text-xs">
                <span className="font-bold text-white block">{user.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="p-8 flex-1 max-w-6xl w-full mx-auto">
          {/* ADMIN PANELS */}
          {activeTab === 'slots' && <AdminSlotsTab showToast={showToast} />}
          {activeTab === 'candidates' && <AdminCandidatesTab showToast={showToast} />}
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              members={members}
              syndicates={syndicates}
              onNavigateTab={setActiveTab}
            />
          )}
          {activeTab === 'syndicates' && (
            <SyndicatesTab
              syndicates={syndicates}
              onRefresh={loadOverviewData}
              showToast={showToast}
            />
          )}

          {/* CANDIDATE PANELS */}
          {activeTab === 'available-slots' && (
            <CandidateAvailableSlotsTab
              showToast={showToast}
              onBookSuccess={() => setActiveTab('my-bookings')}
            />
          )}
          {activeTab === 'my-bookings' && (
            <CandidateBookingsTab
              showToast={showToast}
              onNavigateSlots={() => setActiveTab('available-slots')}
            />
          )}
          {activeTab === 'my-feedback' && <CandidateFeedbackTab showToast={showToast} />}
          {activeTab === 'my-tasks' && <CandidateTasksTab showToast={showToast} />}

          {/* SHARED PROFILE TAB */}
          {activeTab === 'profile' && <ProfileTab user={user} />}
        </main>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

// ==========================================
// APP ROOT
// ==========================================
export default function App() {
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const token = localStorage.getItem('lab_token');
    if (!token) {
      setUser(null);
      return;
    }
    request('/api/auth/me')
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('lab_token');
        setUser(null);
      });
  }, []);

  function handleLogout() {
    localStorage.removeItem('lab_token');
    setUser(null);
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-300">Initializing Cortex Platform...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={setUser} />}
      />
      <Route path="/auth/callback" element={<Callback onLoginSuccess={setUser} />} />
      <Route
        path="*"
        element={
          user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}
