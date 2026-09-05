"use client";

import { useCallback, useEffect, useState } from "react";
import { getAttendance, updateAttendance } from "@/lib/api/attendanceApi";

/**
 * Loads one Attendance record for the detail/correction Form. There is no
 * "create" mode here — records only come into existence via check-in, so
 * `id` is always required.
 */
export default function useAttendance(id) {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchRecord = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttendance(id);
      setRecord(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = await updateAttendance(id, payload);
        setRecord(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { record, loading, error, saving, save, refetch: fetchRecord };
}
