# Empyrean — IoT Air Quality Monitoring Dashboard

A React + Vite web frontend for the Empyrean IoT air quality monitoring system.
Provides real-time dashboards, historical trends, role-based access control, and personalised health alerts.

---

## Tech Stack

| Layer | Library |
|-------|---------|
| Framework | React 19 + TypeScript |
| Bundler | Vite |
| Routing | React Router v7 |
| Styling | Tailwind CSS (utility-first) |
| Auth | Firebase Auth (+ local demo mode) |
| Database | Firestore |
| Charts | Chart.js + react-chartjs-2 |
| Animation | Motion / Framer Motion |
| Icons | Lucide React |

---

## Project Structure

```
web/src/
├── components/
│   ├── admin/       # Admin-specific layout pieces (AdminLayout, AdminSidebar, AdminTopBar)
│   ├── common/      # Shared UI atoms (AQIBadge, AlertToast, ConditionSelector, LoadingSkeleton)
│   ├── layout/      # User-facing layout pieces (DashboardLayout, Sidebar, TopBar)
│   ├── map/         # Leaflet map wrapper (Map.tsx)
│   └── onboarding/  # Multi-step registration flow (Stepper.tsx)
├── constants/
│   ├── conditions.ts   # STANDARD_CONDITIONS, VULNERABILITY_GROUPS, SENSITIVE_CONDITIONS
│   ├── nodes.ts        # Static node configuration (ids, names, coordinates)
│   └── thresholds.ts   # DEFAULT_THRESHOLDS + AQI_CATEGORIES
├── context/
│   └── AuthContext.ts  # Re-exports AuthProvider + useAuth from services/
├── hooks/
│   └── useAuth.ts      # Re-exports useAuth for canonical hook import path
├── pages/
│   ├── admin/       # Admin screens (Dashboard, Users, Nodes, Alerts, Analytics, Audit, Thresholds)
│   ├── public/      # Unauthenticated pages (HeroSection, LoginPage, CreateAccountPage)
│   └── user/        # Authenticated user screens (Dashboard, Alerts, History, NodeDetail, Profile)
├── routes/
│   └── ProtectedRoute.tsx  # Role-aware route guards + RootRedirect
├── scripts/
│   └── seed.js      # Firestore seed script (run from project root, not via Vite)
└── services/
    ├── api.ts        # REST API client (all fetch calls)
    └── useAuth.tsx   # AuthContext provider + useAuth hook implementation
```

---

## Getting Started

### 1. Prerequisites

- Node.js ≥ 18
- A Firebase project with Auth + Firestore enabled

### 2. Environment variables

```bash
cp .env.example .env
# Fill in your Firebase credentials in .env
```

> `.env` is gitignored. **Never commit secrets.**

### 3. Install & run

```bash
npm install
npm run dev        # http://localhost:5173
```

### 4. Seed demo data (optional)

```bash
# From the web/ directory:
node src/scripts/seed.js
```

Requires `FIREBASE_SERVICE_ACCOUNT` or equivalent env vars in `.env`.

---

## Roles

| Role | Access |
|------|--------|
| `user` | Dashboard, Alerts, History, Node Detail, Profile |
| `admin` | All user routes + Admin Console (Users, Nodes, Alerts, Analytics, Audit, Thresholds) |

Role is stored in Firestore (`users/{uid}.role`) and enforced via `ProtectedRoute`.

---

## Demo Mode

When `VITE_DEMO_MODE=true` (or logging in as `user1/password123` or `admin/admin123`), the app uses local mock data instead of hitting Firebase — no credentials required.

---

## Key Conventions

- **Static data** → `src/constants/` (never inline in components)
- **Firebase / API logic** → `src/services/` (never in pages or components)
- **Route guards** → `src/routes/ProtectedRoute.tsx`
- **Global state** → `src/context/AuthContext.ts` (re-exports from `services/useAuth.tsx`)
- **Page-level imports**: always use `../../components/...`, `../../services/...`, `../../constants/...`
