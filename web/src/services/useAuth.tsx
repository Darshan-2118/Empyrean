import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as apiLogin } from './api';

export interface UserProfile {
  username: string;
  displayName: string;
  email: string;
  role: 'user' | 'admin';
  assignedNode?: string;         // e.g. "node1"
  healthConditions?: string[];   // e.g. ["Asthma", "Elderly (60+)"]
  avatar?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  refreshTokenValue: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── Demo user seeds ──────────────────────────────────────────────────────────
const DEMO_USERS: Record<string, UserProfile & { password: string; token: string }> = {
  user1: {
    username: 'user1',
    displayName: 'Chirag Mehta',
    email: 'chirag@empyrean.io',
    role: 'user',
    assignedNode: 'node1',
    healthConditions: [],
    avatar: '',
    password: 'user1',
    token: 'demo-token-user1',
  },
  admin1: {
    username: 'admin1',
    displayName: 'System Administrator',
    email: 'admin@empyrean.io',
    role: 'admin',
    assignedNode: undefined,
    healthConditions: [],
    avatar: '',
    password: 'admin1',
    token: 'demo-token-admin1',
  },
  // legacy demo shortcut
  admin: {
    username: 'admin',
    displayName: 'System Administrator',
    email: 'admin@empyrean.io',
    role: 'admin',
    assignedNode: undefined,
    healthConditions: [],
    avatar: '',
    password: 'admin',
    token: 'demo-token-admin',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
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
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.clear();
      }
    }

    setIsLoading(false);
  }, []);

  const persistAuth = (tok: string, refresh: string | null, profile: UserProfile) => {
    setToken(tok);
    setRefreshTokenValue(refresh);
    setUser(profile);
    localStorage.setItem('empyrean_token', tok);
    if (refresh) localStorage.setItem('empyrean_refresh_token', refresh);
    localStorage.setItem('empyrean_user', JSON.stringify(profile));
  };

  const handleLogin = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Demo login shortcuts
      const demo = DEMO_USERS[username];
      if (demo && demo.password === password) {
        const { password: _pw, token: demoTok, ...profile } = demo;
        persistAuth(demoTok, 'demo-refresh', profile);
        return;
      }

      // Real API login
      const response = await apiLogin(username, password);
      const profile: UserProfile = {
        username,
        displayName: response.display_name || username,
        email: response.email || `${username}@empyrean.io`,
        role: response.role || 'user',
        assignedNode: response.assigned_node,
        healthConditions: response.health_conditions || [],
        avatar: response.avatar || '',
      };
      persistAuth(response.access_token, response.refresh_token, profile);
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

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('empyrean_user', JSON.stringify(updated));
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
        updateUserProfile,
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
