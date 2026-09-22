import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/models';
import api from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  updateUser: (updated: Partial<User>) => void;
  isGuest: boolean;
  guestPerspective: 'admin' | 'student';
  setGuestPerspective: (mode: 'admin' | 'student') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('iat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('iat_token')
  );
  const [loading, setLoading] = useState(true);
  const [guestPerspective, setGuestPerspectiveState] = useState<'admin' | 'student'>(() => {
    const saved = localStorage.getItem('iat_guest_perspective');
    return saved === 'student' ? 'student' : 'admin';
  });

  const isGuest = user?.roles?.includes('Guest') ?? false;

  const setGuestPerspective = (mode: 'admin' | 'student') => {
    setGuestPerspectiveState(mode);
    localStorage.setItem('iat_guest_perspective', mode);
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
            localStorage.setItem('iat_user', JSON.stringify(res.data.data));
          }
        } catch {
          localStorage.removeItem('iat_token');
          localStorage.removeItem('iat_user');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('iat_token', newToken);
    localStorage.setItem('iat_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('iat_token');
      localStorage.removeItem('iat_user');
      setToken(null);
      setUser(null);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.roles?.includes('Super Admin') || user.roles?.includes('CEO')) {
      // Super Admin and CEO have unrestricted global visibility
      return true;
    }
    return user.permissions?.includes(permission) ?? false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.roles?.includes(role) ?? false;
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updated };
      setUser(updatedUser);
      localStorage.setItem('iat_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasPermission,
        hasRole,
        updateUser,
        isGuest,
        guestPerspective,
        setGuestPerspective,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
