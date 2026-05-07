import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/useAuth';

// ── Loading spinner shown while auth state is resolving ──
export function AuthSpinner() {
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

export function ProtectedRoute({
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

  // Prevent cross-role access
  if (role === 'user' && userRole === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'admin' && userRole !== 'admin') return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

// ── Root redirect — sends user to their role's home after login ──
export function RootRedirect() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <AuthSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
}
