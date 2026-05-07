import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/useAuth';
import HeroSection from './components/HeroSection';
import LoginPage from './components/LoginPage';
import CreateAccountPage from './components/CreateAccountPage';
import DashboardPage from './components/DashboardPage';
import HistoryScreen from './components/HistoryScreen';
import AlertsScreen from './components/AlertsScreen';
import NodeDetailScreen from './components/NodeDetailScreen';
import AdminNodesScreen from './components/AdminNodesScreen';
import AdminSettingsScreen from './components/AdminSettingsScreen';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HeroSection />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/history" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
          <Route path="/dashboard/history/:nodeId" element={<ProtectedRoute><HistoryScreen /></ProtectedRoute>} />
          <Route path="/dashboard/alerts" element={<ProtectedRoute><AlertsScreen /></ProtectedRoute>} />
          <Route path="/dashboard/node/:nodeId" element={<ProtectedRoute><NodeDetailScreen /></ProtectedRoute>} />
          <Route path="/admin/nodes" element={<ProtectedRoute><AdminNodesScreen /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute><AdminSettingsScreen /></ProtectedRoute>} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
