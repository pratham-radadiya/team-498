"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listEmployees } from "@/lib/api/employeeApi";

const KANBAN_FETCH_LIMIT = 500;

/**
 * Drives the Employees "Kanban view" — per Docs/api/phase-1-employee-user.md
 * this reuses POST /api/employees/list with a small/large page size and
 * groups the result client-side by department.
 */
export default function useEmployeesKanban({ search = "" } = {}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterModel = search
        ? { name: { filterType: "text", type: "contains", filter: search } }
        : {};
      const data = await listEmployees({ startRow: 0, endRow: KANBAN_FETCH_LIMIT, filterModel });
      setRows(data.rows ?? []);
    } catch (err) {
      setError(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const groups = useMemo(() => {
    const map = new Map();
    for (const employee of rows) {
      const key = employee.department || "Unassigned";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(employee);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([department, employees]) => ({ department, employees }));
  }, [rows]);

  return { groups, loading, error, refetch: fetchAll };
}
