import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/useAuth';
import { ProtectedRoute, RootRedirect } from './routes/ProtectedRoute';

// Public pages
import HeroSection from './pages/public/HeroSection';
import LoginPage from './pages/public/LoginPage';
import CreateAccountPage from './pages/public/CreateAccountPage';

// User pages
import DashboardPage from './pages/user/DashboardPage';
import HistoryScreen from './pages/user/HistoryScreen';
import AlertsScreen from './pages/user/AlertsScreen';
import NodeDetailScreen from './pages/user/NodeDetailScreen';
import ProfilePage from './pages/user/ProfilePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersScreen from './pages/admin/AdminUsersScreen';
import AdminNodesScreen from './pages/admin/AdminNodesScreen';
import AdminAlertsScreen from './pages/admin/AdminAlertsScreen';
import AdminAnalyticsScreen from './pages/admin/AdminAnalyticsScreen';
import AdminAuditLog from './pages/admin/AdminAuditLog';
import AdminThresholds from './pages/admin/AdminThresholds';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />

          {/* User routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="user"><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute role="user"><HistoryScreen /></ProtectedRoute>} />
          <Route path="/dashboard/history/:nodeId" element={<ProtectedRoute role="user"><HistoryScreen /></ProtectedRoute>} />
          <Route path="/alerts" element={<ProtectedRoute role="user"><AlertsScreen /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute role="user"><ProfilePage /></ProtectedRoute>} />
          <Route path="/dashboard/node/:nodeId" element={<ProtectedRoute role="user"><NodeDetailScreen /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsersScreen /></ProtectedRoute>} />
          <Route path="/admin/nodes" element={<ProtectedRoute role="admin"><AdminNodesScreen /></ProtectedRoute>} />
          <Route path="/admin/alerts" element={<ProtectedRoute role="admin"><AdminAlertsScreen /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalyticsScreen /></ProtectedRoute>} />
          <Route path="/admin/audit" element={<ProtectedRoute role="admin"><AdminAuditLog /></ProtectedRoute>} />
          <Route path="/admin/thresholds" element={<ProtectedRoute role="admin"><AdminThresholds /></ProtectedRoute>} />

          {/* Catch-all: redirect based on auth + role */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
