"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listContracts, listEmployeeContracts } from "@/lib/api/contractApi";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Drives the Contracts List view against POST /api/contracts/list.
 * Filterable columns: status, employeeId (both equals) — per
 * Docs/api/phase-2-working-schedule-contract.md.
 *
 * Pass `employeeId` to scope to one employee's contracts instead — this
 * hits the dedicated POST /api/employees/[id]/contracts route (which forces
 * employeeId server-side) rather than filtering the general list, backing
 * the Employee Form's "Contracts N" smart button.
 */
export default function useContractsGrid({ employeeId, pageSize = DEFAULT_PAGE_SIZE } = {}) {
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
      const data = employeeId
        ? await listEmployeeContracts(employeeId, { startRow, endRow, sortModel, filterModel })
        : await listContracts({ startRow, endRow, sortModel, filterModel });
      setRows(data.rows ?? []);
      setRowCount(data.rowCount ?? 0);
    } catch (err) {
      setError(err);
      setRows([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [employeeId, page, pageSize, sortModel, filterModel]);

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
