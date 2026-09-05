'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');

  const fetchSchedules = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/working-schedules/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setSchedules(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch working schedules';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScheduleOptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/working-schedules/options');
      const opts = response.data || [];
      setOptions(opts);
      return opts;
    } catch (err) {
      console.error('Failed to fetch schedule options:', err);
      return [];
    }
  }, []);

  const fetchScheduleById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/working-schedules/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load working schedule';
      throw new Error(msg);
    }
  }, []);

  const createSchedule = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/working-schedules', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create working schedule';
      throw new Error(msg);
    }
  }, []);

  const updateSchedule = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/working-schedules/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update working schedule';
      throw new Error(msg);
    }
  }, []);

  const deleteSchedule = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/working-schedules/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete working schedule';
      throw new Error(msg);
    }
  }, []);

  return {
    schedules,
    totalCount,
    loading,
    error,
    options,
    fetchSchedules,
    fetchScheduleOptions,
    fetchScheduleById,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
