"use client";

import { useCallback, useEffect, useState } from "react";
import { createTimeOffType, getTimeOffType, updateTimeOffType } from "@/lib/api/timeOffTypeApi";

/** Pass `id` to edit an existing Time Off Type, or omit it to create one. */
export default function useTimeOffType(id) {
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchType = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTimeOffType(id);
      setType(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchType();
  }, [fetchType]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateTimeOffType(id, payload) : await createTimeOffType(payload);
        setType(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { type, loading, error, saving, save, refetch: fetchType };
}
