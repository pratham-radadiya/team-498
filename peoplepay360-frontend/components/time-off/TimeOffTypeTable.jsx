"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useTimeOffTypesGrid from "@/hooks/timeOff/useTimeOffTypesGrid";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import TimeOffTypeFilters from "@/components/time-off/TimeOffTypeFilters";

const COLUMNS = [
  { colId: "name", label: "Type", sortable: true },
  { colId: "unit", label: "Unit" },
  { colId: "requiresAllocation", label: "Allocation" },
  { colId: "approvalRole", label: "Approval" },
  { colId: "status", label: "Status", sortable: true },
];

export default function TimeOffTypeTable() {
  const grid = useTimeOffTypesGrid();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <TimeOffTypeFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          grid.updateFilter("name", value);
        }}
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          grid.updateFilter("status", value);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {grid.loading ? (
          <SkeletonTable columns={COLUMNS.length} />
        ) : grid.error ? (
          <ErrorState message={grid.error.message} onRetry={grid.refetch} />
        ) : grid.rows.length === 0 ? (
          <EmptyState title="No time off types found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    {COLUMNS.map((col) => {
                      const active = grid.sortModel.find((s) => s.colId === col.colId);
                      return (
                        <th key={col.colId} scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
                          {col.sortable ? (
                            <button
                              type="button"
                              onClick={() => grid.toggleSort(col.colId)}
                              className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-zinc-100"
                            >
                              {col.label}
                              {active ? (
                                active.sort === "asc" ? (
                                  <ArrowUp className="h-3.5 w-3.5" />
                                ) : (
                                  <ArrowDown className="h-3.5 w-3.5" />
                                )
                              ) : (
                                <ArrowUpDown className="h-3.5 w-3.5 text-zinc-300 dark:text-zinc-600" />
                              )}
                            </button>
                          ) : (
                            col.label
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {grid.rows.map((type) => (
                    <tr key={type.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      <td className="px-4 py-2.5">
                        <Link href={`/time-off/types/${type.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                          {type.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{type.unit}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{type.requiresAllocation ? "Required" : "No"}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{type.approvalRole}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={type.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={grid.page} totalPages={grid.totalPages} rowCount={grid.rowCount} onPageChange={grid.setPage} />
          </>
        )}
      </div>
    </div>
  );
}
