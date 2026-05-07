import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/useAuth';
import HeroSection from './components/HeroSection';
import LoginPage from './components/LoginPage';
import CreateAccountPage from './components/CreateAccountPage';

// User routes
import DashboardPage from './components/DashboardPage';
import HistoryScreen from './components/HistoryScreen';
import AlertsScreen from './components/AlertsScreen';
import NodeDetailScreen from './components/NodeDetailScreen';
import ProfilePage from './components/ProfilePage';

// Admin routes
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsersScreen from './components/admin/AdminUsersScreen';
import AdminNodesScreen from './components/admin/AdminNodesScreen';
import AdminAlertsScreen from './components/admin/AdminAlertsScreen';
import AdminAnalyticsScreen from './components/admin/AdminAnalyticsScreen';
import AdminAuditLog from './components/admin/AdminAuditLog';
import AdminThresholds from './components/admin/AdminThresholds';

// ── Loading spinner ──
function AuthSpinner() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-white/60 animate-pulse font-medium tracking-widest">EMPYREAN</span>
      </div>
    </div>
  );
}

// ── Role-aware protected route ──
type RequiredRole = 'user' | 'admin' | 'any';

function ProtectedRoute({
  children,
  role = 'any',
}: {
  children: React.ReactNode;
  role?: RequiredRole;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <AuthSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const userRole = user?.role || 'user';

  // Role-specific redirect (can't cross into the other role's area)
  if (role === 'user' && userRole === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'admin' && userRole !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ── Root redirect based on role ──
function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <AuthSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />

          {/* ── User routes (role: "user" only) ── */}
          <Route path="/dashboard" element={<ProtectedRoute role="user"><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute role="user"><HistoryScreen /></ProtectedRoute>} />
          <Route path="/dashboard/history/:nodeId" element={<ProtectedRoute role="user"><HistoryScreen /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute role="user"><AlertsScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute role="user"><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/node/:nodeId" element={<ProtectedRoute role="user"><NodeDetailScreen /></ProtectedRoute>} />

          {/* ── Admin routes (role: "admin" only) ── */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersScreen /></ProtectedRoute>} />
          <Route path="/admin/nodes" element={<ProtectedRoute role="admin"><AdminNodesScreen /></ProtectedRoute>} />
          <Route path="/admin/alerts" element={<ProtectedRoute role="admin"><AdminAlertsScreen /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalyticsScreen /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAuditLog /></ProtectedRoute>} />
          <Route path="/admin/thresholds" element={<ProtectedRoute role="admin"><AdminThresholds /></ProtectedRoute>} />

          {/* Catch-all: route based on auth state */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
