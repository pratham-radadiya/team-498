"use client";

import { useEffect, useMemo, useState } from "react";
import { listEmployees } from "@/lib/api/employeeApi";

const FETCH_LIMIT = 500;

/**
 * There's no dedicated "list of departments" endpoint, so this derives the
 * distinct, non-empty department values from the employee list — same
 * approach useEmployeesKanban already uses to group employees by
 * department, just reduced to the unique labels instead of full rows.
 */
export default function useDepartmentOptions() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    let cancelled = false;
    listEmployees({ startRow: 0, endRow: FETCH_LIMIT })
      .then((data) => {
        if (!cancelled) setRows(data.rows ?? []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(() => {
    const departments = new Set(rows.map((row) => row.department).filter(Boolean));
    return Array.from(departments).sort((a, b) => a.localeCompare(b));
  }, [rows]);
}
