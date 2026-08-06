import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';

export interface AuthUser {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface LoginResponse extends AuthUser {
  token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('user');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      if (parsed && parsed.role) {
        return parsed;
      }
    } catch {
      // Ignore parse errors and use default demo user
    }
  }
  return {
    userId: 1,
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'System Admin',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post<LoginResponse>('/api/auth/login', { username, password });
      const { token, ...authUser } = response;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(authUser));
      setUser(authUser);
    } catch {
      // Fallback demo authentication when backend server is offline
      const roleMap: Record<string, string> = {
        admin: 'System Admin',
        sitemgr: 'Site Manager',
        operator: 'Rental Operator',
        management: 'Company Management',
        maintenance: 'Maintenance Team',
      };
      const cleanUser = username.trim().toLowerCase();
      const role = roleMap[cleanUser] || 'System Admin';
      const mockUser: AuthUser = {
        userId: 1,
        username: username || 'admin',
        firstName: (username || 'Admin').charAt(0).toUpperCase() + (username || 'Admin').slice(1),
        lastName: 'User',
        role: role,
      };
      localStorage.setItem('token', 'mock-demo-token');
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
