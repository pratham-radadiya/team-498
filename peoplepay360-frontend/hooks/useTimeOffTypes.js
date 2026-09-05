'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useTimeOffTypes() {
  const [types, setTypes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState('');

  const fetchTypes = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/timeoff/types/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setTypes(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch time off types';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTypeOptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/timeoff/types/options');
      const opts = response.data || [];
      setOptions(opts);
      return opts;
    } catch (err) {
      console.error('Failed to fetch time off type options:', err);
      return [];
    }
  }, []);

  const fetchTypeById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/timeoff/types/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load time off type';
      throw new Error(msg);
    }
  }, []);

  const createType = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/timeoff/types', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create time off type';
      throw new Error(msg);
    }
  }, []);

  const updateType = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/timeoff/types/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update time off type';
      throw new Error(msg);
    }
  }, []);

  const deleteType = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/timeoff/types/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete time off type';
      throw new Error(msg);
    }
  }, []);

  return {
    types,
    totalCount,
    loading,
    error,
    options,
    fetchTypes,
    fetchTypeOptions,
    fetchTypeById,
    createType,
    updateType,
    deleteType,
  };
}
