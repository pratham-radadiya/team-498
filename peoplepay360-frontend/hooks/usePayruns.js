'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function usePayruns() {
  const [payruns, setPayruns] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPayruns = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/payruns/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setPayruns(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch payruns';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEligibleEmployees = useCallback(async (periodStart, periodEnd) => {
    try {
      const response = await apiClient.post('/api/payruns/eligible-employees', {
        periodStart,
        periodEnd,
      });
      return response.data || [];
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load eligible employees';
      throw new Error(msg);
    }
  }, []);

  const fetchPayrunById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/payruns/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load payrun details';
      throw new Error(msg);
    }
  }, []);

  const createPayrun = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/payruns', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create payrun';
      throw new Error(msg);
    }
  }, []);

  const computePayrun = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/payruns/${id}/compute`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to compute payrun';
      throw new Error(msg);
    }
  }, []);

  const validatePayrun = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/payruns/${id}/validate`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to validate payrun';
      throw new Error(msg);
    }
  }, []);

  const markPaid = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/payruns/${id}/mark-paid`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to mark payrun as paid';
      throw new Error(msg);
    }
  }, []);

  const sendPayslips = useCallback(async (id) => {
    try {
      const response = await apiClient.post(`/api/payruns/${id}/send-payslips`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to send payslips';
      throw new Error(msg);
    }
  }, []);

  const deletePayrun = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/payruns/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete payrun';
      throw new Error(msg);
    }
  }, []);

  return {
    payruns,
    totalCount,
    loading,
    error,
    fetchPayruns,
    fetchEligibleEmployees,
    fetchPayrunById,
    createPayrun,
    computePayrun,
    validatePayrun,
    markPaid,
    sendPayslips,
    deletePayrun,
  };
}
