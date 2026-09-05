"use client";

import { useCallback, useEffect, useState } from "react";
import useAuth from "@/hooks/auth/useAuth";
import { checkIn as apiCheckIn, checkOut as apiCheckOut, getCurrentAttendance } from "@/lib/api/attendanceApi";

/**
 * Backs the top-nav Attendance quick-action widget, via
 * GET /api/attendance/current (added in Phase 4 — Phase 3 had to infer this
 * from the list endpoint since the dedicated route didn't exist yet).
 */
export default function useAttendanceStatus() {
  const { user } = useAuth();
  const employeeId = user?.employeeId;

  const [current, setCurrent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(Boolean(employeeId));
  const [acting, setActing] = useState(false);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    if (!employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCurrentAttendance();
      setCurrent(data.attendance ?? null);
      setIsOpen(Boolean(data.isOpen));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const elapsedSeconds =
    isOpen && current?.checkIn ? Math.max(0, Math.floor((now - new Date(current.checkIn).getTime()) / 1000)) : 0;

  const checkIn = useCallback(async () => {
    setActing(true);
    setError(null);
    try {
      await apiCheckIn();
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setActing(false);
    }
  }, [refresh]);

  const checkOut = useCallback(async () => {
    setActing(true);
    setError(null);
    try {
      await apiCheckOut();
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setActing(false);
    }
  }, [refresh]);

  return {
    available: Boolean(employeeId),
    isOpen,
    elapsedSeconds,
    loading,
    acting,
    error,
    checkIn,
    checkOut,
  };
}
