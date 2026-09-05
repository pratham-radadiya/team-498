"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useWorkingSchedulesGrid from "@/hooks/workingSchedules/useWorkingSchedulesGrid";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import WorkingScheduleFilters from "@/components/working-schedules/WorkingScheduleFilters";

const COLUMNS = [
  { colId: "name", label: "Schedule Name", sortable: true },
  { colId: "daysPerWeek", label: "Days/Week" },
  { colId: "hoursPerWeek", label: "Hours/Week" },
  { colId: "company", label: "Company" },
  { colId: "status", label: "Status", sortable: true },
];

export default function WorkingScheduleTable() {
  const grid = useWorkingSchedulesGrid();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <WorkingScheduleFilters
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
          <EmptyState title="No working schedules found" description="Try adjusting your search or filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    {COLUMNS.map((col) => {
                      const active = grid.sortModel.find((s) => s.colId === col.colId);
                      return (
                        <th
                          key={col.colId}
                          scope="col"
                          className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400"
                        >
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
                  {grid.rows.map((schedule) => (
                    <tr key={schedule.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/working-schedules/${schedule.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {schedule.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{schedule.days?.length ?? "—"}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {schedule.totalWeeklyHours != null ? `${schedule.totalWeeklyHours}h` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{schedule.company || "—"}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={schedule.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={grid.page}
              totalPages={grid.totalPages}
              rowCount={grid.rowCount}
              onPageChange={grid.setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
