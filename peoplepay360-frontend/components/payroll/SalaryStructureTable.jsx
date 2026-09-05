"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import useSalaryStructuresGrid from "@/hooks/payroll/useSalaryStructuresGrid";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import SalaryStructureFilters from "@/components/payroll/SalaryStructureFilters";

const COLUMNS = [
  { colId: "name", label: "Structure Name", sortable: true },
  { colId: "ruleCount", label: "Rules" },
  { colId: "employeeCount", label: "Employees" },
  { colId: "active", label: "Active", sortable: true },
];

export default function SalaryStructureTable() {
  const grid = useSalaryStructuresGrid();
  const [search, setSearch] = useState("");
  const [active, setActive] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <SalaryStructureFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          grid.updateFilter("name", value);
        }}
        active={active}
        onActiveChange={(value) => {
          setActive(value);
          grid.updateFilter("active", value === "" ? "" : value === "true");
        }}
      />

      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        {grid.loading ? (
          <SkeletonTable columns={COLUMNS.length} />
        ) : grid.error ? (
          <ErrorState message={grid.error.message} onRetry={grid.refetch} />
        ) : grid.rows.length === 0 ? (
          <EmptyState title="No salary structures found" description="Try adjusting your search or filters." />
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
                  {grid.rows.map((structure) => (
                    <tr key={structure.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                      <td className="px-4 py-2.5">
                        <Link
                          href={`/payroll/structures/${structure.id}`}
                          className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {structure.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{structure.ruleCount ?? 0}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{structure.employeeCount ?? 0}</td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{structure.active ? "Yes" : "No"}</td>
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
