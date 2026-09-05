"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, List, Plus } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import PageHeader from "@/components/common/PageHeader";
import EmployeeKanban from "@/components/employees/EmployeeKanban";
import EmployeeTable from "@/components/employees/EmployeeTable";

const VIEWS = { KANBAN: "kanban", LIST: "list" };

export default function EmployeesPage() {
  const [view, setView] = useState(VIEWS.KANBAN);
  const { can } = useRole();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Employees"
        description="Browse the employee master and open a record to view or edit it."
        actions={
          <>
            <div className="flex items-center rounded-md border border-zinc-300 bg-white p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setView(VIEWS.KANBAN)}
                aria-pressed={view === VIEWS.KANBAN}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium ${
                  view === VIEWS.KANBAN
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setView(VIEWS.LIST)}
                aria-pressed={view === VIEWS.LIST}
                className={`flex items-center gap-1.5 rounded px-2.5 py-1.5 text-sm font-medium ${
                  view === VIEWS.LIST
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
            </div>
            {can("employees", "create") && (
              <Link
                href="/employees/new"
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                New Employee
              </Link>
            )}
          </>
        }
      />

      {view === VIEWS.KANBAN ? <EmployeeKanban /> : <EmployeeTable />}
    </div>
  );
}
