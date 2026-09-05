"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listSalaryStructures } from "@/lib/api/salaryStructureApi";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Drives the Salary Structures List against POST /api/salary-structures/list.
 * Filterable columns: name (contains), active (equals) — per
 * Docs/api/phase-5-salary.md. Rows already carry ruleCount/employeeCount.
 */
export default function useSalaryStructuresGrid({ pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({});
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startRow = page * pageSize;
      const endRow = startRow + pageSize;
      const data = await listSalaryStructures({ startRow, endRow, sortModel, filterModel });
      setRows(data.rows ?? []);
      setRowCount(data.rowCount ?? 0);
    } catch (err) {
      setError(err);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, filterModel]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const toggleSort = useCallback((colId) => {
    setSortModel((prev) => {
      const existing = prev.find((s) => s.colId === colId);
      if (!existing) return [{ colId, sort: "asc" }];
      if (existing.sort === "asc") return [{ colId, sort: "desc" }];
      return [];
    });
    setPage(0);
  }, []);

  const updateFilter = useCallback((column, value) => {
    setFilterModel((prev) => {
      const next = { ...prev };
      // `value === ""` means "no selection" — distinct from the real boolean
      // `false` for the "active" column, which must still apply a filter.
      if (value === "" || value === undefined || value === null) {
        delete next[column];
      } else if (column === "active") {
        next[column] = { filterType: "boolean", type: "equals", filter: value };
      } else {
        next[column] = { filterType: "text", type: "contains", filter: value };
      }
      return next;
    });
    setPage(0);
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(rowCount / pageSize)), [rowCount, pageSize]);

  return {
    rows,
    rowCount,
    loading,
    error,
    page,
    totalPages,
    pageSize,
    sortModel,
    filterModel,
    setPage,
    toggleSort,
    updateFilter,
    refetch: fetchPage,
  };
}
