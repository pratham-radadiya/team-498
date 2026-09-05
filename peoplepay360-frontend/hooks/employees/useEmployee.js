"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createEmployee,
  getEmployee,
  updateEmployee,
} from "@/lib/api/employeeApi";

/**
 * Loads a single employee for the Employee Form. Pass `id` to edit an
 * existing record, or omit it to back a "create" form (no fetch happens).
 */
export default function useEmployee(id) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchEmployee = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployee(id);
      setEmployee(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateEmployee(id, payload) : await createEmployee(payload);
        setEmployee(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { employee, loading, error, saving, save, refetch: fetchEmployee };
}
