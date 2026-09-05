"use client";

import { useState } from "react";
import Link from "next/link";
import useContractsGrid from "@/hooks/contracts/useContractsGrid";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import StatusBadge from "@/components/common/StatusBadge";
import Pagination from "@/components/common/Pagination";
import ContractFilters from "@/components/contracts/ContractFilters";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : null;
}

/** Pass `employeeId` to scope this table to one employee's contracts (smart button / Contracts page filter). */
export default function ContractTable({ employeeId }) {
  const grid = useContractsGrid({ employeeId });
  const employeeNames = useEmployeeOptionsMap();
  const [status, setStatus] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <ContractFilters
        status={status}
        onStatusChange={(value) => {
          setStatus(value);
          grid.updateFilter("status", value);
        }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {grid.loading ? (
          <SkeletonTable columns={employeeId ? 4 : 5} />
        ) : grid.error ? (
          <ErrorState message={grid.error.message} onRetry={grid.refetch} />
        ) : grid.rows.length === 0 ? (
          <EmptyState title="No contracts found" description="Try adjusting your filters." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Period</th>
                    {!employeeId && (
                      <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Employee</th>
                    )}
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Job Position</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Wage/Month</th>
                    <th className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {grid.rows.map((contract) => (
                    <tr key={contract.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {formatDate(contract.startDate)} → {formatDate(contract.endDate) || "Ongoing"}
                        </Link>
                      </td>
                      {!employeeId && (
                        <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                          {employeeNames.get(contract.employeeId) || contract.employeeId}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{contract.jobPosition || "—"}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{contract.wage?.toLocaleString?.() ?? contract.wage}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={contract.status} />
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
