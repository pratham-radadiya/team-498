"use client";

import { useCallback, useEffect, useState } from "react";
import { createSalaryRule, getSalaryRule, updateSalaryRule } from "@/lib/api/salaryRuleApi";

/** Pass `id` to edit an existing Salary Rule, or omit it to create one. */
export default function useSalaryRule(id) {
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRule = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getSalaryRule(id);
      setRule(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRule();
  }, [fetchRule]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateSalaryRule(id, payload) : await createSalaryRule(payload);
        setRule(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { rule, loading, error, saving, save, refetch: fetchRule };
}
