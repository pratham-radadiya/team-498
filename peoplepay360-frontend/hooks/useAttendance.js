'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useAttendance() {
  const [records, setRecords] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAttendanceList = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/attendance/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setRecords(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch attendance records';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const getCurrentSession = useCallback(async (employeeId = null) => {
    try {
      const url = employeeId ? `/api/attendance/current?employeeId=${employeeId}` : '/api/attendance/current';
      const response = await apiClient.get(url);
      return response.data; // { isOpen: boolean, attendance: Attendance | null }
    } catch (err) {
      console.error('Failed to fetch current attendance session:', err);
      return { isOpen: false, attendance: null };
    }
  }, []);

  const checkIn = useCallback(async (employeeId = null) => {
    try {
      const payload = employeeId ? { employeeId } : {};
      const response = await apiClient.post('/api/attendance/check-in', payload);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Check-in failed';
      throw new Error(msg);
    }
  }, []);

  const checkOut = useCallback(async (employeeId = null) => {
    try {
      const payload = employeeId ? { employeeId } : {};
      const response = await apiClient.post('/api/attendance/check-out', payload);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Check-out failed';
      throw new Error(msg);
    }
  }, []);

  const fetchAttendanceById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/attendance/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load attendance record';
      throw new Error(msg);
    }
  }, []);

  const correctAttendance = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/attendance/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to correct attendance record';
      throw new Error(msg);
    }
  }, []);

  const deleteAttendance = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/attendance/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete attendance record';
      throw new Error(msg);
    }
  }, []);

  return {
    records,
    totalCount,
    loading,
    error,
    fetchAttendanceList,
    getCurrentSession,
    checkIn,
    checkOut,
    fetchAttendanceById,
    correctAttendance,
    deleteAttendance,
  };
}
