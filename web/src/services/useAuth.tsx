import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as apiLogin } from './api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  refreshTokenValue: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load auth from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('empyrean_token');
    const storedRefreshToken = localStorage.getItem('empyrean_refresh_token');
    const storedUser = localStorage.getItem('empyrean_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshTokenValue(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // ── Demo login: admin / admin (bypasses backend) ──
      if (username === 'admin' && password === 'admin') {
        const demoToken = 'demo-token-empyrean';
        const demoRefresh = 'demo-refresh-empyrean';
        const demoUser = { username: 'admin', role: 'admin' };

        setToken(demoToken);
        setRefreshTokenValue(demoRefresh);
        setUser(demoUser);

        localStorage.setItem('empyrean_token', demoToken);
        localStorage.setItem('empyrean_refresh_token', demoRefresh);
        localStorage.setItem('empyrean_user', JSON.stringify(demoUser));
        return;
      }

      const response = await apiLogin(username, password);
      
      setToken(response.access_token);
      setRefreshTokenValue(response.refresh_token);
      setUser({ username, role: response.role });

      // Store in localStorage
      localStorage.setItem('empyrean_token', response.access_token);
      localStorage.setItem('empyrean_refresh_token', response.refresh_token);
      localStorage.setItem('empyrean_user', JSON.stringify({ username, role: response.role }));
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    localStorage.removeItem('empyrean_token');
    localStorage.removeItem('empyrean_refresh_token');
    localStorage.removeItem('empyrean_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshTokenValue,
        isLoading,
        error,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
