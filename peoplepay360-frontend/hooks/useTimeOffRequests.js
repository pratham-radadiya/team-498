'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useTimeOffRequests() {
  const [requests, setRequests] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/timeoff/requests/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setRequests(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch time off requests';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequestById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/timeoff/requests/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load request details';
      throw new Error(msg);
    }
  }, []);

  const createRequest = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/timeoff/requests', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create time off request';
      throw new Error(msg);
    }
  }, []);

  const approveRequest = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/timeoff/requests/${id}/approve`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to approve request';
      throw new Error(msg);
    }
  }, []);

  const refuseRequest = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/timeoff/requests/${id}/refuse`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to refuse request';
      throw new Error(msg);
    }
  }, []);

  const deleteRequest = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/timeoff/requests/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete request';
      throw new Error(msg);
    }
  }, []);

  return {
    requests,
    totalCount,
    loading,
    error,
    fetchRequests,
    fetchRequestById,
    createRequest,
    approveRequest,
    refuseRequest,
    deleteRequest,
  };
}
