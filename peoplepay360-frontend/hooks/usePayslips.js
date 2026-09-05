'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function usePayslips() {
  const [payslips, setPayslips] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPayslips = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/payslips/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setPayslips(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch payslips';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayslipById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/payslips/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load payslip details';
      throw new Error(msg);
    }
  }, []);

  const getPdfUrl = useCallback((id) => {
    return `/api/payslips/${id}/pdf`;
  }, []);

  const deletePayslip = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/payslips/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete payslip';
      throw new Error(msg);
    }
  }, []);

  return {
    payslips,
    totalCount,
    loading,
    error,
    fetchPayslips,
    fetchPayslipById,
    getPdfUrl,
    deletePayslip,
  };
}
