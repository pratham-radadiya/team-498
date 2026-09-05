"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useAttendanceGrid from "@/hooks/attendance/useAttendanceGrid";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";

function formatDateTime(value) {
  return value ? new Date(value).toLocaleString() : "—";
}

/** Pass `employeeId` to scope this table to one employee (smart button / Attendance page filter). */
export default function AttendanceTable({ employeeId }) {
  const grid = useAttendanceGrid({ employeeId });
  const employeeNames = useEmployeeOptionsMap();
  const [status, setStatus] = useState("");

  const columns = [
    { colId: "checkIn", label: "Check In", sortable: true },
    { colId: "checkOut", label: "Check Out", sortable: true },
    { colId: "workedHours", label: "Worked Hours" },
    { colId: "overtime", label: "Overtime" },
    { colId: "status", label: "Status", sortable: true },
  ];

  return (
    <div className="flex flex-col gap-4">
      <AttendanceFilters
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          grid.updateFilter("status", value);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {grid.loading ? (
          <SkeletonTable columns={employeeId ? columns.length : columns.length + 1} />
        ) : grid.error ? (
          <ErrorState message={grid.error.message} onRetry={grid.refetch} />
        ) : grid.rows.length === 0 ? (
          <EmptyState title="No attendance records found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    {!employeeId && (
                      <th scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
                        Employee
                      </th>
                    )}
                    {columns.map((col) => {
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
                  {grid.rows.map((record) => (
                    <tr key={record.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      {!employeeId && (
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {employeeNames.get(record.employeeId) || record.employeeId}
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/attendance/${record.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {formatDateTime(record.checkIn)}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{formatDateTime(record.checkOut)}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {record.workedHours != null ? `${record.workedHours}h` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {record.overtime != null ? `${record.overtime}h` : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={record.status} />
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
