'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useSalaryStructures() {
  const [structures, setStructures] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchStructures = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/salary-structures/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setStructures(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch salary structures';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStructureOptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/salary-structures/options');
      return response.data || [];
    } catch (err) {
      console.error('Failed to load salary structure options:', err);
      return [];
    }
  }, []);

  const fetchStructureById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/salary-structures/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load structure details';
      throw new Error(msg);
    }
  }, []);

  const createStructure = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/salary-structures', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create salary structure';
      throw new Error(msg);
    }
  }, []);

  const updateStructure = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/salary-structures/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update salary structure';
      throw new Error(msg);
    }
  }, []);

  const deleteStructure = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/salary-structures/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete salary structure';
      throw new Error(msg);
    }
  }, []);

  return {
    structures,
    totalCount,
    loading,
    error,
    fetchStructures,
    fetchStructureOptions,
    fetchStructureById,
    createStructure,
    updateStructure,
    deleteStructure,
  };
}
