'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useAllocations() {
  const [allocations, setAllocations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAllocations = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/timeoff/allocations/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setAllocations(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch allocations';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllocationById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/timeoff/allocations/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load allocation details';
      throw new Error(msg);
    }
  }, []);

  const createAllocation = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/timeoff/allocations', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create allocation';
      throw new Error(msg);
    }
  }, []);

  const updateAllocation = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/timeoff/allocations/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update allocation';
      throw new Error(msg);
    }
  }, []);

  const approveAllocation = useCallback(async (id) => {
    try {
      const response = await apiClient.patch(`/api/timeoff/allocations/${id}`, { status: 'Approved' });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to approve allocation';
      throw new Error(msg);
    }
  }, []);

  const refuseAllocation = useCallback(async (id) => {
    try {
      const response = await apiClient.patch(`/api/timeoff/allocations/${id}`, { status: 'Refused' });
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to refuse allocation';
      throw new Error(msg);
    }
  }, []);

  const deleteAllocation = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/timeoff/allocations/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete allocation';
      throw new Error(msg);
    }
  }, []);

  return {
    allocations,
    totalCount,
    loading,
    error,
    fetchAllocations,
    fetchAllocationById,
    createAllocation,
    updateAllocation,
    approveAllocation,
    refuseAllocation,
    deleteAllocation,
  };
}
