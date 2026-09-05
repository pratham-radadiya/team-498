"use client";

import { useEffect, useMemo, useState } from "react";
import { getOptions } from "@/lib/api/optionsApi";

/**
 * Resolves employee id -> name for list-table display (e.g. the Contracts
 * List's Employee column), reusing the same GET /api/employees/options
 * endpoint the OptionsSelect field uses — just consumed as a lookup Map
 * instead of a dropdown.
 */
export default function useEmployeeOptionsMap() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getOptions("/api/employees/options").then((data) => {
      if (!cancelled) setOptions(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => new Map(options.map((o) => [o.id, o.label])), [options]);
}
