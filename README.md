# Lab Member Management System

A production-grade, full-stack laboratory management platform featuring an **MVC / Repository pattern** backend, a **React + Tailwind CSS** dashboard, **PostgreSQL** managed with **Prisma ORM (Neon serverless)**, **Google OAuth 2.0** authentication, and strict **Role-Based Access Control (RBAC)** organized by Lab Syndicates.

---

## ⚡ Role-Based Access Control (RBAC) Matrix

| Role | Access Permissions & Dashboard Views |
| :--- | :--- |
| **`SUPER_ADMIN`** | Complete system oversight. Views all members across all syndicates, modifies member roles, re-assigns members to syndicates, creates new syndicates, and manages resource/token allocations. |
| **`SYNDICATE_LEAD`** | Syndicate-scoped view. Sees only the members assigned to their syndicate, along with the syndicate mission, resource metrics, and token compute card. |
| **`MEMBER`** | Read-only profile view with assigned syndicate details, team count, and resource quota. |
| **`GUEST`** | Restricted profile view displaying **"Awaiting Admin Approval"** banner until promoted by a Super Admin. |

---

## 🏗️ Architecture & Technology Stack

- **Backend:** Node.js + Express (MVC & Repository Pattern)
- **Database & ORM:** PostgreSQL on [Neon.tech](https://neon.tech) + Prisma ORM (with `@prisma/adapter-neon` WebSocket driver for seamless port 443 connectivity)
- **Frontend:** React 18 (Vite) + Tailwind CSS + Lucide Icons + React Router 7
- **Authentication:** Google OAuth 2.0 via Passport.js + signed JWT session tokens (plus Instant Demo Role Switcher for evaluation)
- **Deployment:** Containerized (`Dockerfile`), Vercel-ready frontend (`vercel.json`), Render/Railway-ready backend

---

## 🚀 Quick Start (Run Locally)

### 1. Prerequisites
- **Node.js**: v20 or higher
- **PostgreSQL Database**: Free serverless DB on [Neon](https://neon.tech) (already configured in `.env.local`)

### 2. Install Dependencies
From the repository root:
```bash
npm install
```

### 3. Database Schema & Initial Seeding
The database schema is already applied on your Neon instance. To seed the initial syndicates (*Bio-Tech Syndicate*, *Robotics Guild*, *Quantum Computing Lab*, *AI & Cybernetics Lab*) and demo personnel:
```bash
npm run seed
```

### 4. Start the Application
Run both backend and frontend concurrently:
```bash
npm run dev
```

- **Frontend Dashboard:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **API Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

> **Pro Tip:** On the login screen, you can use **Sign in with Google** or click any of the **Instant Role Demo** buttons (👑 Super Admin, 🛡️ Syndicate Lead, 🔬 Lab Member, ⏳ Guest) to immediately experience each RBAC perspective!

---

## 🌐 Production Deployment Guide (Deadline: 28th Night)

### Step 1: Backend Deployment on Render or Railway

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: complete production lab member management system"
   git remote add origin https://github.com/YOUR_USERNAME/lab-member-management-system.git
   git branch -M main
   git push -u origin main
   ```
2. In [Render](https://render.com) (or [Railway](https://railway.app)):
   - Click **New Web Service** and connect your GitHub repository.
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `node src/server.js`
3. Add the following **Environment Variables** in Render / Railway:
   | Key | Value |
   | :--- | :--- |
   | `DATABASE_URL` | Your Neon pooled connection string |
   | `DATABASE_URL_UNPOOLED` | Your Neon direct connection string |
   | `JWT_SECRET` | A secure 64-character random string |
   | `FRONTEND_URL` | Your Vercel frontend URL (e.g. `https://lab-system.vercel.app`) |
   | `BACKEND_URL` | Your Render backend URL (e.g. `https://lab-api.onrender.com`) |
   | `GOOGLE_CLIENT_ID` | Your Google OAuth Web Client ID |
   | `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
   | `INITIAL_SUPER_ADMIN_EMAIL`| Your Google email (e.g. `yourname@gmail.com`) |
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
4. Click **Deploy**. Note your live backend URL (e.g., `https://lab-api.onrender.com`).

---

### Step 2: Frontend Deployment on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the Project:
   - **Framework Preset:** `Vite`
   - **Root Directory:** click Edit and choose `frontend`
4. Add the **Environment Variable**:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_URL` | Your deployed backend URL (e.g. `https://lab-api.onrender.com`) |
5. Click **Deploy**.
6. Vercel will build and assign your live production URL (e.g., `https://lab-system.vercel.app`).
7. Update `FRONTEND_URL` in your backend Render environment variables with this live Vercel URL.

---

### Step 3: Google Cloud OAuth 2.0 Credentials (Optional / Production)

1. Open the [Google Cloud Console Credentials Page](https://console.cloud.google.com/apis/credentials).
2. Click **Create Credentials** → **OAuth client ID**.
3. Select **Web application**.
4. Set:
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `https://your-vercel-domain.vercel.app`
   - **Authorized redirect URIs:**
     - `http://localhost:4000/api/auth/google/callback`
     - `https://your-backend-domain.onrender.com/api/auth/google/callback`
5. Copy your **Client ID** and **Client Secret** into your backend `.env` and Render dashboard.

---

## 📁 Repository Directory Structure

```text
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL Schema (User, Syndicate, Role enum)
│   │   └── seed.js                # Database seeder with sample syndicates and users
│   ├── src/
│   │   ├── config/
│   │   │   └── passport.js        # Google OAuth 2.0 Passport strategy
│   │   ├── controllers/
│   │   │   ├── authController.js  # OAuth callback, JWT generation, demo login
│   │   │   ├── memberController.js# RBAC-filtered members query and role patch
│   │   │   └── syndicateController.js # Syndicate CRUD & resource management
│   │   ├── lib/
│   │   │   └── prisma.js          # Prisma client with Neon WebSocket adapter
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT verification & checkRole RBAC guard
│   │   ├── repositories/
│   │   │   ├── memberRepository.js
│   │   │   └── syndicateRepository.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── memberRoutes.js
│   │   │   └── syndicateRoutes.js
│   │   └── server.js              # Express app bootstrap & CORS handling
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api.js                 # API client with JWT bearer interceptor
│   │   ├── App.jsx                # Reactive dashboard with RBAC sidebar & views
│   │   ├── main.jsx
│   │   └── styles.css             # Tailwind base & custom design system
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vercel.json                # Single-page app routing rewrites
│   └── package.json
│
├── .env.example
├── .env.local                     # Neon PostgreSQL connection parameters
├── package.json                   # Root monorepo workspace scripts
└── README.md
```

---

## 🧪 Verification & Proof of Functionality

- [x] **Prisma Database Schema:** Validated & active on Neon PostgreSQL.
- [x] **Neon Connection:** Active via `@prisma/adapter-neon` over WebSocket (port 443).
- [x] **RBAC Enforcement:**
  - `SUPER_ADMIN` can read all members and patch roles/syndicates (`200 OK`).
  - `SYNDICATE_LEAD` can read only members in their assigned syndicate (`200 OK`).
  - `MEMBER` & `GUEST` blocked with `403 Forbidden` on admin endpoints.
- [x] **Frontend Production Build:** Vite build passes cleanly (`✓ built in 2.7s`).
- [x] **Container & Server:** Health endpoint verified at `GET /health` (`status: ok`).
