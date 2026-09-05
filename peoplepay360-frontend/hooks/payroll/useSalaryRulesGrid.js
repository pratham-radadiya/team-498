"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listSalaryRules } from "@/lib/api/salaryRuleApi";

const DEFAULT_PAGE_SIZE = 20;

/**
 * Drives the Salary Rules List against POST /api/salary-rules/list.
 * The server defaults to sequence-ascending when no sortModel is sent, so
 * this hook starts with an empty sortModel rather than forcing one client-
 * side. Filterable columns: structureId, category (both equals) — per
 * Docs/api/phase-5-salary.md.
 *
 * Pass `structureId` to scope to one structure's rules (e.g. from the
 * Structures list) — forces filterModel.structureId client-side, same
 * pattern as Phase 3/4's employeeId scoping.
 */
export default function useSalaryRulesGrid({ structureId, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [page, setPage] = useState(0);
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({});
  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const effectiveFilterModel = useMemo(() => {
    if (!structureId) return filterModel;
    return { ...filterModel, structureId: { filterType: "text", type: "equals", filter: structureId } };
  }, [filterModel, structureId]);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const startRow = page * pageSize;
      const endRow = startRow + pageSize;
      const data = await listSalaryRules({ startRow, endRow, sortModel, filterModel: effectiveFilterModel });
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
