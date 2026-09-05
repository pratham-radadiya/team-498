"use client";

import { ShieldOff } from "lucide-react";
import useRole from "@/hooks/auth/useRole";

/** Gates a route to the given roles; renders a Forbidden message otherwise. */
export default function RequireRole({ roles, children }) {
  const { isRole } = useRole();

  if (!isRole(...roles)) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
        <ShieldOff className="h-8 w-8 text-zinc-300 dark:text-zinc-600" aria-hidden="true" />
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">You don&apos;t have access to this page</p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Contact an administrator if you believe this is a mistake.</p>
      </div>
    );
  }

  return children;
}
