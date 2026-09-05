"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createWorkingSchedule,
  getWorkingSchedule,
  updateWorkingSchedule,
} from "@/lib/api/workingScheduleApi";

/**
 * Loads a single Working Schedule for the Form. Pass `id` to edit an
 * existing record, or omit it to back a "create" form (no fetch happens).
 * `schedule` always reflects the server response, so `days[].hours` and
 * `totalWeeklyHours` are the API's computed values, never derived here.
 */
export default function useWorkingSchedule(id) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchSchedule = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWorkingSchedule(id);
      setSchedule(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateWorkingSchedule(id, payload) : await createWorkingSchedule(payload);
        setSchedule(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { schedule, loading, error, saving, save, refetch: fetchSchedule };
}
