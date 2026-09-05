"use client";

import { useMemo } from "react";
import useAuth from "@/hooks/auth/useAuth";
import { can } from "@/lib/rbac/permissions";

export default function useRole() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return useMemo(
    () => ({
      role,
      isRole: (...roles) => roles.includes(role),
      can: (module, action) => can(role, module, action),
    }),
    [role]
  );
}
