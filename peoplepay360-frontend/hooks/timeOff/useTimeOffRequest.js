"use client";

import { useCallback, useEffect, useState } from "react";
import {
  approveTimeOffRequest,
  createTimeOffRequest,
  getTimeOffRequest,
  refuseTimeOffRequest,
} from "@/lib/api/timeOffRequestApi";

/**
 * Loads a single Time Off Request. There is no edit/PATCH endpoint — once
 * created, a request can only be approved, refused, or deleted, so `save`
 * here always creates (used by the Request Form's create-only flow).
 */
export default function useTimeOffRequest(id) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deciding, setDeciding] = useState(false);

  const fetchRequest = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTimeOffRequest(id);
      setRequest(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const create = useCallback(async (payload) => {
    setSaving(true);
    try {
      const result = await createTimeOffRequest(payload);
      setRequest(result);
      return result;
    } finally {
      setSaving(false);
    }
  }, []);

  const approve = useCallback(async () => {
    setDeciding(true);
    try {
      const result = await approveTimeOffRequest(id);
      setRequest(result);
      return result;
    } finally {
      setDeciding(false);
    }
  }, [id]);

  const refuse = useCallback(async () => {
    setDeciding(true);
    try {
      const result = await refuseTimeOffRequest(id);
      setRequest(result);
      return result;
    } finally {
      setDeciding(false);
    }
  }, [id]);

  return { request, loading, error, saving, deciding, create, approve, refuse, refetch: fetchRequest };
}
