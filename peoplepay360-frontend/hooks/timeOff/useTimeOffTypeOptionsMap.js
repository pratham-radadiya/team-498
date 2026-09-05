"use client";

import { useEffect, useMemo, useState } from "react";
import { getOptions } from "@/lib/api/optionsApi";

/**
 * Resolves Time Off Type id -> name for list-table display (Allocations and
 * Requests lists), reusing GET /api/timeoff/types/options as a lookup Map —
 * same approach as useEmployeeOptionsMap.
 */
export default function useTimeOffTypeOptionsMap() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getOptions("/api/timeoff/types/options").then((data) => {
      if (!cancelled) setOptions(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => new Map(options.map((o) => [o.id, o.label])), [options]);
}
