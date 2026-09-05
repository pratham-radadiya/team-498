"use client";

import { useEffect, useMemo, useState } from "react";
import { getOptions } from "@/lib/api/optionsApi";

/**
 * Resolves Salary Structure id -> name for the Rules list's Structure
 * column, reusing GET /api/salary-structures/options as a lookup Map — same
 * approach as useEmployeeOptionsMap / useTimeOffTypeOptionsMap. Only called
 * from pages already gated to HR Payroll User+, so the endpoint's 403 for
 * HR Manager never applies here.
 */
export default function useSalaryStructureOptionsMap() {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getOptions("/api/salary-structures/options").then((data) => {
      if (!cancelled) setOptions(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => new Map(options.map((o) => [o.id, o.label])), [options]);
}
