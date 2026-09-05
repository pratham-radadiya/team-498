"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createSalaryStructure,
  getSalaryStructure,
  updateSalaryStructure,
} from "@/lib/api/salaryStructureApi";

/** Pass `id` to edit an existing Salary Structure, or omit it to create one. */
export default function useSalaryStructure(id) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchStructure = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSalaryStructure(id);
      setStructure(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStructure();
  }, [fetchStructure]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateSalaryStructure(id, payload) : await createSalaryStructure(payload);
        setStructure(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { structure, loading, error, saving, save, refetch: fetchStructure };
}
