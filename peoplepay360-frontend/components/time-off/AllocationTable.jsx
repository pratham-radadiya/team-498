"use client";

import { useState } from "react";
import Link from "next/link";
import useAllocationsGrid from "@/hooks/timeOff/useAllocationsGrid";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import useTimeOffTypeOptionsMap from "@/hooks/timeOff/useTimeOffTypeOptionsMap";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import AllocationFilters from "@/components/time-off/AllocationFilters";

/** Pass `employeeId` to scope this table to one employee (smart button / Allocations page filter). */
export default function AllocationTable({ employeeId }) {
  const grid = useAllocationsGrid({ employeeId });
  const employeeNames = useEmployeeOptionsMap();
  const typeNames = useTimeOffTypeOptionsMap();
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <AllocationFilters
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          grid.updateFilter("status", value);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {grid.loading ? (
          <SkeletonTable columns={employeeId ? 5 : 6} />
        ) : grid.error ? (
          <ErrorState message={grid.error.message} onRetry={grid.refetch} />
        ) : grid.rows.length === 0 ? (
          <EmptyState title="No allocations found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    {!employeeId && (
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Employee</th>
                    )}
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Type</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Allocated</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Taken</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Remaining</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {grid.rows.map((allocation) => (
                    <tr key={allocation.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      {!employeeId && (
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {employeeNames.get(allocation.employeeId) || allocation.employeeId}
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/time-off/allocations/${allocation.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {typeNames.get(allocation.typeId) || allocation.typeId}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{allocation.allocated}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{allocation.taken ?? 0}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{allocation.remaining}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={allocation.status} />
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
