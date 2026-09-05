'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';

export function useAttendanceWidget() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  const hasCheckedRef = useRef(false);

  // Check active attendance session status once
  const checkActiveSession = useCallback(async () => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    try {
      const response = await apiClient.get('/api/attendance/current').catch(() => null);
      if (response && response.data && response.data.isOpen && response.data.attendance) {
        const sessionData = response.data.attendance;
        setIsCheckedIn(true);
        setActiveSessionId(sessionData.id);
        const startTime = new Date(sessionData.checkIn).getTime();
        setCheckInTime(startTime);
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }
    } catch (err) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  // Live timer interval when checked in
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - checkInTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCheckedIn, checkInTime]);

  const formatTime = (totalSec) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const toggleAttendance = async () => {
    setLoading(true);
    try {
      if (isCheckedIn) {
        await apiClient.post('/api/attendance/check-out', {}).catch(() => {});

        setIsCheckedIn(false);
        setActiveSessionId(null);
        setCheckInTime(null);
        setElapsedSeconds(0);
      } else {
        const now = Date.now();
        const response = await apiClient.post('/api/attendance/check-in', {}).catch(() => null);

        const rec = response?.data;
        setIsCheckedIn(true);
        const startTime = rec?.checkIn ? new Date(rec.checkIn).getTime() : now;
        setCheckInTime(startTime);
        setActiveSessionId(rec?.id || 'active');
      }
    } catch (err) {
      console.error('Failed to toggle attendance', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    isCheckedIn,
    elapsedFormatted: formatTime(elapsedSeconds),
    loading,
    toggleAttendance,
  };
}
