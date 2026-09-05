"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listAllocations } from "@/lib/api/allocationApi";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Drives the Allocations List against POST /api/timeoff/allocations/list.
 * Filterable columns: employeeId, typeId, status (all equals) — per
 * Docs/api/phase-4-time-off.md.
 *
 * Pass `employeeId` to scope to one employee (Employee Form's "Allocations
 * N" smart button) — per the doc, there's no dedicated scoped route yet, so
 * this forces filterModel.employeeId client-side (the server double-
 * enforces it for the EMPLOYEE role regardless), same approach as Phase 3's
 * Attendance list.
 */
export default function useAllocationsGrid({ employeeId, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({});
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const effectiveFilterModel = useMemo(() => {
    if (!employeeId) return filterModel;
    return { ...filterModel, employeeId: { filterType: "text", type: "equals", filter: employeeId } };
  }, [filterModel, employeeId]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startRow = page * pageSize;
      const endRow = startRow + pageSize;
      const data = await listAllocations({ startRow, endRow, sortModel, filterModel: effectiveFilterModel });
      setRows(data.rows ?? []);
      setRowCount(data.rowCount ?? 0);
    } catch (err) {
      setError(err);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortModel, effectiveFilterModel]);

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
      if (!value) {
        delete next[column];
      } else {
        next[column] = { filterType: "text", type: "equals", filter: value };
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
