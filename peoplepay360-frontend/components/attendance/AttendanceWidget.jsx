"use client";

import { useState } from "react";
import { Clock } from "lucide-react";
import useAttendanceStatus from "@/hooks/attendance/useAttendanceStatus";
import Button from "@/components/ui/Button";

function formatElapsed(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(totalSeconds % 60)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * Top-nav quick-action widget: no active session -> Check In; an open
 * session -> Check Out with a live elapsed timer, indicator turns green
 * on an open session — per project-overview.md's mockup notes.
 */
export default function AttendanceWidget() {
  const [open, setOpen] = useState(false);
  const { available, isOpen, elapsedSeconds, loading, acting, error, checkIn, checkOut } = useAttendanceStatus();

  if (!available) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center rounded-md p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        aria-label="Attendance"
      >
        <Clock className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
        <span
          className={`absolute right-1 top-1 h-2 w-2 rounded-full ${isOpen ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-600"}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1 w-56 rounded-md border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {loading ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Checking status...</p>
          ) : isOpen ? (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Checked in</p>
              <p className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">{formatElapsed(elapsedSeconds)}</p>
              <Button size="sm" variant="danger" loading={acting} onClick={checkOut}>
                Check Out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Not checked in</p>
              <Button size="sm" loading={acting} onClick={checkIn}>
                Check In
              </Button>
            </div>
          )}
          {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error.message}</p>}
        </div>
      )}
    </div>
  );
}
