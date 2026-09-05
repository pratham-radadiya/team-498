"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import useEmployeesKanban from "@/hooks/employees/useEmployeesKanban";
import Input from "@/components/ui/Input";
import SkeletonKanban from "@/components/common/SkeletonKanban";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import EmployeeKanbanCard from "@/components/employees/EmployeeKanbanCard";

export default function EmployeeKanban() {
  const [search, setSearch] = useState("");
  const { groups, loading, error, refetch } = useEmployeesKanban({ search });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <SkeletonKanban />
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : groups.length === 0 ? (
        <EmptyState title="No employees found" description="Try adjusting your search." />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {groups.map((group) => (
            <div key={group.department} className="flex w-72 shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{group.department}</h3>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  {group.employees.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {group.employees.map((employee) => (
                  <EmployeeKanbanCard key={employee.id} employee={employee} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
