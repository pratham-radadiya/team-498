"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/auth/useAuth";
import AppShellSkeleton from "@/components/layout/AppShellSkeleton";

/** Redirects to /login when there is no authenticated session. */
export default function RouteGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <AppShellSkeleton />;
  }

  return children;
}
