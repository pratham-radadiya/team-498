"use client";

import { useCallback, useEffect, useState } from "react";
import { createContract, getContract, updateContract } from "@/lib/api/contractApi";

/**
 * Loads a single Contract for the Contract Form. Pass `id` to edit an
 * existing record, or omit it to back a "create" form (no fetch happens).
 */
export default function useContract(id) {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchContract = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getContract(id);
      setContract(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchContract();
  }, [fetchContract]);

  const save = useCallback(
    async (payload) => {
      setSaving(true);
      try {
        const result = id ? await updateContract(id, payload) : await createContract(payload);
        setContract(result);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [id]
  );

  return { contract, loading, error, saving, save, refetch: fetchContract };
}
