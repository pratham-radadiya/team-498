"use client";

import { useCallback, useEffect, useState } from "react";
import { createUser, getUser, updateUser } from "@/lib/api/userApi";

/** Loads a single user for the Create/Edit User form; omit `id` to create. */
export default function useUser(id) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUser(id);
      setUser(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateUser(id, payload) : await createUser(payload);
        setUser(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { user, loading, error, saving, save, refetch: fetchUser };
}
