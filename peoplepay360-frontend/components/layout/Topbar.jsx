"use client";

import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import useAuth from "@/hooks/auth/useAuth";
import { ROLE_LABELS } from "@/lib/constants/roles";
import Avatar from "@/components/ui/Avatar";
import AttendanceWidget from "@/components/attendance/AttendanceWidget";
import ThemeToggle from "@/components/layout/ThemeToggle";

export default function Topbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <header className="flex h-14 items-center justify-end gap-2 border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900">
      <AttendanceWidget />
      <ThemeToggle />
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Avatar name={user.email} size="sm" />
          <span className="hidden text-left text-sm sm:block">
            <span className="block font-medium text-zinc-900 dark:text-zinc-100">{user.email}</span>
            <span className="block text-xs text-zinc-500 dark:text-zinc-400">{ROLE_LABELS[user.role] ?? user.role}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-zinc-400" />
        </button>
        {open && (
          <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
