"use client";

import { useCallback, useEffect, useState } from "react";
import { createAllocation, getAllocation, updateAllocation } from "@/lib/api/allocationApi";

/** Pass `id` to edit/approve an existing Allocation, or omit it to create one. */
export default function useAllocation(id) {
  const [allocation, setAllocation] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAllocation = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getAllocation(id);
      setAllocation(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAllocation();
  }, [fetchAllocation]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateAllocation(id, payload) : await createAllocation(payload);
        setAllocation(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { allocation, loading, error, saving, save, refetch: fetchAllocation };
}
