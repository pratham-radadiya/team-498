"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AuthContext from "@/lib/context/authContext";
import * as authApi from "@/lib/api/authApi";

export default function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const session = await authApi.getSession();
      setUser(session?.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      router.push("/login");
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [router]);

  const login = useCallback(async (credentials) => {
    const session = await authApi.login(credentials);
    setUser(session?.user ?? null);
    return session;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, refreshSession }),
    [user, loading, login, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
