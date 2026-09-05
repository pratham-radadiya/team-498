'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useSalaryRules() {
  const [rules, setRules] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRules = useCallback(async (params = { startRow: 0, endRow: 100 }) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.post('/api/salary-rules/list', params);
      const rows = response.data?.rows || [];
      const count = response.data?.rowCount || rows.length;
      setRules(rows);
      setTotalCount(count);
      return { rows, rowCount: count };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to fetch salary rules';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRuleById = useCallback(async (id) => {
    try {
      const response = await apiClient.get(`/api/salary-rules/${id}`);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to load rule details';
      throw new Error(msg);
    }
  }, []);

  const createRule = useCallback(async (data) => {
    try {
      const response = await apiClient.post('/api/salary-rules', data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to create salary rule';
      throw new Error(msg);
    }
  }, []);

  const updateRule = useCallback(async (id, data) => {
    try {
      const response = await apiClient.patch(`/api/salary-rules/${id}`, data);
      return response.data;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to update salary rule';
      throw new Error(msg);
    }
  }, []);

  const deleteRule = useCallback(async (id) => {
    try {
      await apiClient.delete(`/api/salary-rules/${id}`);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to delete salary rule';
      throw new Error(msg);
    }
  }, []);

  const fetchAvailableRuleOptions = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/salary-rules/options');
      return response.data || [];
    } catch (err) {
      console.error('Failed to load salary rule options:', err);
      return [];
    }
  }, []);

  return {
    rules,
    totalCount,
    loading,
    error,
    fetchRules,
    fetchRuleById,
    fetchAvailableRuleOptions,
    createRule,
    updateRule,
    deleteRule,
  };
}
