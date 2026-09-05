'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useContracts() {
  const [contracts, setContracts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchContracts = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/contracts/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setContracts(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch contracts';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchScopedContracts = useCallback(async (employeeId, params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post(`/api/employees/${employeeId}/contracts`, params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setContracts(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch employee contracts';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchContractById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/contracts/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load contract details';
      throw new Error(msg);
    }
  }, []);

  const createContract = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/contracts', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create contract';
      throw new Error(msg);
    }
  }, []);

  const updateContract = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/contracts/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update contract';
      throw new Error(msg);
    }
  }, []);

  const deleteContract = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/contracts/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete contract';
      throw new Error(msg);
    }
  }, []);

  return {
    contracts,
    totalCount,
    loading,
    error,
    fetchContracts,
    fetchScopedContracts,
    fetchContractById,
    createContract,
    updateContract,
    deleteContract,
  };
}
