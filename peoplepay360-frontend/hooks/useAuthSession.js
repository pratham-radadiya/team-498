'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/auth/session');
      if (data && data.user && data.user.employeeId) {
        setSession(data);
      } else {
        setSession(null);
      }
    } catch (err) {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCsrf = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/auth/csrf');
      if (data && data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
    } catch (err) {
      console.error('Failed to fetch CSRF token', err);
    }
  }, []);

  useEffect(() => {
    fetchSession();
    fetchCsrf();
  }, [fetchSession, fetchCsrf]);

  const signOut = async () => {
    try {
      const csrf = csrfToken || (await apiClient.get('/api/auth/csrf')).data?.csrfToken;
      await apiClient.post(
        '/api/auth/signout',
        new URLSearchParams({
          csrfToken: csrf,
          json: 'true',
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      );
    } catch (err) {
      console.error('Sign out error', err);
    } finally {
      setSession(null);
      window.location.href = '/login';
    }
  };

  const value = {
    session,
    user: session?.user || null,
    role: session?.user?.role || null,
    employeeId: session?.user?.employeeId || null,
    loading,
    csrfToken,
    refetchSession: fetchSession,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  const context = useContext(AuthContext);

  // Standalone fallback hook state if called outside Provider
  const [standaloneSession, setStandaloneSession] = useState(null);
  const [standaloneLoading, setStandaloneLoading] = useState(true);
  const [standaloneCsrf, setStandaloneCsrf] = useState(null);

  useEffect(() => {
    if (!context) {
      let isMounted = true;
      const getSession = async () => {
        try {
          const { data } = await apiClient.get('/api/auth/session');
          if (isMounted) {
            if (data && data.user) {
              setStandaloneSession(data);
            } else {
              setStandaloneSession(null);
            }
          }
        } catch (e) {
          if (isMounted) setStandaloneSession(null);
        } finally {
          if (isMounted) setStandaloneLoading(false);
        }
      };

      const getCsrf = async () => {
        try {
          const { data } = await apiClient.get('/api/auth/csrf');
          if (isMounted && data?.csrfToken) {
            setStandaloneCsrf(data.csrfToken);
          }
        } catch (e) {}
      };

      getSession();
      getCsrf();

      return () => {
        isMounted = false;
      };
    }
  }, [context]);

  if (context) {
    return context;
  }

  const standaloneSignOut = async () => {
    try {
      const csrf = standaloneCsrf || (await apiClient.get('/api/auth/csrf')).data?.csrfToken;
      await apiClient.post(
        '/api/auth/signout',
        new URLSearchParams({ csrfToken: csrf, json: 'true' }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
    } catch (e) {
    } finally {
      window.location.href = '/login';
    }
  };

  return {
    session: standaloneSession,
    user: standaloneSession?.user || null,
    role: standaloneSession?.user?.role || null,
    employeeId: standaloneSession?.user?.employeeId || null,
    loading: standaloneLoading,
    csrfToken: standaloneCsrf,
    refetchSession: () => {},
    signOut: standaloneSignOut,
  };
}
