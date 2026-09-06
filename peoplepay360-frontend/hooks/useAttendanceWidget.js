'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useAttendanceWidget() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const calcElapsed = (startTime) => {
    if (!startTime) return 0;
    const diffMs = Math.max(0, Date.now() - startTime);
    return Math.floor(diffMs / 1000);
  };

  // Check active attendance session status
  const fetchActiveSession = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/attendance/current').catch(() => null);
      if (response && response.data && response.data.isOpen && response.data.attendance) {
        const sessionData = response.data.attendance;
        setIsCheckedIn(true);
        setActiveSessionId(sessionData.id);
        const parsedTime = new Date(sessionData.checkIn).getTime();
        const startTime = isNaN(parsedTime) ? Date.now() : Math.min(parsedTime, Date.now());
        setCheckInTime(startTime);
        setElapsedSeconds(calcElapsed(startTime));
      } else {
        setIsCheckedIn(false);
        setCheckInTime(null);
        setElapsedSeconds(0);
        setActiveSessionId(null);
      }
    } catch (err) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchActiveSession();
  }, [fetchActiveSession]);

  // Live timer interval when checked in
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && checkInTime) {
      setElapsedSeconds(calcElapsed(checkInTime));
      interval = setInterval(() => {
        setElapsedSeconds(calcElapsed(checkInTime));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, checkInTime]);

  const formatTime = (totalSec) => {
    const safeSec = Math.max(0, Math.floor(Number(totalSec) || 0));
    const hours = Math.floor(safeSec / 3600);
    const minutes = Math.floor((safeSec % 3600) / 60);
    const seconds = safeSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const toggleAttendance = async () => {
    setLoading(true);
    try {
      if (isCheckedIn) {
        await apiClient.post('/api/attendance/check-out', {});
        setIsCheckedIn(false);
        setActiveSessionId(null);
        setCheckInTime(null);
        setElapsedSeconds(0);
      } else {
        const response = await apiClient.post('/api/attendance/check-in', {});
        const rec = response?.data;
        setIsCheckedIn(true);
        const parsedStart = rec?.checkIn ? new Date(rec.checkIn).getTime() : Date.now();
        const startTime = isNaN(parsedStart) ? Date.now() : Math.min(parsedStart, Date.now());
        setCheckInTime(startTime);
        setElapsedSeconds(0);
        setActiveSessionId(rec?.id || 'active');
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance-changed'));
      }
    } catch (err) {
      console.error('Failed to toggle attendance', err);
    } finally {
      setLoading(false);
      await fetchActiveSession();
    }
  };

  return {
    isCheckedIn,
    elapsedFormatted: formatTime(elapsedSeconds),
    loading,
    toggleAttendance,
    refetchCurrent: fetchActiveSession,
  };
}
