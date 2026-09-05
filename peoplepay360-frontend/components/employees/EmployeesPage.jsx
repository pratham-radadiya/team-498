"use client";

import { useState } from "react";
import { LayoutGrid, List, Plus } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import PageHeader from "@/components/common/PageHeader";
import EmployeeKanban from "@/components/employees/EmployeeKanban";
import EmployeeTable from "@/components/employees/EmployeeTable";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";

const VIEWS = { KANBAN: "kanban", LIST: "list" };

export default function EmployeesPage() {
  const [view, setView] = useState(VIEWS.KANBAN);
  const [createOpen, setCreateOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [notice, setNotice] = useState(null);
  const { can } = useRole();

  return (
    <div className="flex flex-col gap-4">
      {notice && (
        <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
          {notice}
        </div>
      )}
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
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
              >
                <Plus className="h-4 w-4" />
                New Employee
              </button>
            )}
          </>
        }
      />

      {view === VIEWS.KANBAN ? (
        <EmployeeKanban key={`kanban-${refreshKey}`} />
      ) : (
        <EmployeeTable key={`table-${refreshKey}`} />
      )}

      <EmployeeFormModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(employee, info) => {
          setCreateOpen(false);
          setRefreshKey((k) => k + 1);
          setNotice(info?.userError ?? null);
        }}
      />
    </div>
  );
}
