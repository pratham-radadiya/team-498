'use client';

import { useState, useCallback } from 'react';
import apiClient from '@/lib/api-client';

export function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [error, setError] = useState(null);

  // Fetch paginated / filtered employees list from POST /api/employees/list
  const fetchEmployees = useCallback(async ({ startRow = 0, endRow = 50, sortModel = [], filterModel = {} } = {}) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.post('/api/employees/list', {
        startRow,
        endRow,
        sortModel,
        filterModel,
      });

      if (data) {
        setEmployees(data.rows || []);
        setTotalCount(data.rowCount ?? (data.rows ? data.rows.length : 0));
      }
    } catch (err) {
      setError(err.message || 'Failed to load employees list');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch options for Manager dropdown picker ONCE
  const fetchOptions = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/employees/options');
      setOptions(data || []);
    } catch (err) {
      console.error('Failed to load employee options', err);
    }
  }, []);

  // Fetch single employee detail
  const fetchEmployeeById = useCallback(async (id) => {
    try {
      const { data } = await apiClient.get(`/api/employees/${id}`);
      return data;
    } catch (err) {
      throw err;
    }
  }, []);

  // Create new employee (Admin / HR Manager)
  const createEmployee = async (employeeData) => {
    try {
      const { data } = await apiClient.post('/api/employees', employeeData);
      if (data && data.id) {
        // Prepend newly created employee immediately to local list
        setEmployees((prev) => [data, ...prev.filter((e) => e.id !== data.id)]);
        setTotalCount((prev) => prev + 1);
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Update employee details
  const updateEmployee = async (id, updateData) => {
    try {
      const { data } = await apiClient.patch(`/api/employees/${id}`, updateData);
      if (data && data.id) {
        setEmployees((prev) => prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)));
      }
      return data;
    } catch (err) {
      throw err;
    }
  };

  // Delete employee
  const deleteEmployee = async (id) => {
    try {
      await apiClient.delete(`/api/employees/${id}`);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      throw err;
    }
  };

  return {
    employees,
    totalCount,
    loading,
    options,
    error,
    fetchEmployees,
    fetchOptions,
    fetchEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
}
