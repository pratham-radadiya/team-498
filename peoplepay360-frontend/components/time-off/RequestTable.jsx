"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X as XIcon } from "lucide-react";
import useTimeOffRequestsGrid from "@/hooks/timeOff/useTimeOffRequestsGrid";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import useTimeOffTypeOptionsMap from "@/hooks/timeOff/useTimeOffTypeOptionsMap";
import useRole from "@/hooks/auth/useRole";
import { approveTimeOffRequest, refuseTimeOffRequest } from "@/lib/api/timeOffRequestApi";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import RequestFilters from "@/components/time-off/RequestFilters";
import { TIME_OFF_STATUS } from "@/lib/constants/timeOff";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

/** Pass `employeeId` to scope this table to one employee (smart button / Requests page filter). */
export default function RequestTable({ employeeId }) {
  const grid = useTimeOffRequestsGrid({ employeeId });
  const employeeNames = useEmployeeOptionsMap();
  const typeNames = useTimeOffTypeOptionsMap();
  const { can } = useRole();
  const [status, setStatus] = useState("");
  const [actingId, setActingId] = useState(null);

  const canDecide = can("timeOffRequests", "approve");

  async function handleDecision(id, action) {
    setActingId(id);
    try {
      await (action === "approve" ? approveTimeOffRequest(id) : refuseTimeOffRequest(id));
      await grid.refetch();
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <RequestFilters
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
          <EmptyState title="No time off requests found" description="Try adjusting your filters." />
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
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Start</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">End</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Duration</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                    {canDecide && <th className="px-4 py-2.5" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {grid.rows.map((request) => (
                    <tr key={request.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      {!employeeId && (
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {employeeNames.get(request.employeeId) || request.employeeId}
                        </td>
                      )}
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/time-off/requests/${request.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {typeNames.get(request.typeId) || request.typeId}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{formatDate(request.startDate)}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{formatDate(request.endDate)}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{request.duration}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={request.status} />
                      </td>
                      {canDecide && (
                        <td className="px-4 py-2.5">
                          {request.status === TIME_OFF_STATUS.PENDING && (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleDecision(request.id, "approve")}
                                disabled={actingId === request.id}
                                className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                                aria-label="Approve"
                                title="Approve"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDecision(request.id, "refuse")}
                                disabled={actingId === request.id}
                                className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                aria-label="Refuse"
                                title="Refuse"
                              >
                                <XIcon className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
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
