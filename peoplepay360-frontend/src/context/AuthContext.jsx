'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, logoutApi } from '../api/authApi.js';
import { hasPermission, hasAnyPermission, getRolePermissions } from '../lib/permissions.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('pp360_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch {
      localStorage.removeItem('pp360_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setError(null);
    setLoading(true);
    try {
      const userData = await loginApi({ email, password });
      setUser(userData);
      localStorage.setItem('pp360_user', JSON.stringify(userData));
      if (userData.token) localStorage.setItem('pp360_token', userData.token);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      localStorage.removeItem('pp360_user');
      localStorage.removeItem('pp360_token');
    }
  }, []);

  const can = useCallback(
    (permission) => {
      if (!user?.role) return false;
      return hasPermission(user.role, permission);
    },
    [user?.role]
  );

  const canAny = useCallback(
    (permissions) => {
      if (!user?.role) return false;
      return hasAnyPermission(user.role, permissions);
    },
    [user?.role]
  );

  const value = {
    user,
    role: user?.role || null,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    can,
    canAny,
    permissions: user?.role ? getRolePermissions(user.role) : [],
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
