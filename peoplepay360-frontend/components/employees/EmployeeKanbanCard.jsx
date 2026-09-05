import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import StatusBadge from "@/components/common/StatusBadge";

export default function EmployeeKanbanCard({ employee }) {
  return (
    <Link
      href={`/employees/${employee.id}`}
      className="flex items-center gap-3 rounded-md border border-zinc-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <Avatar name={employee.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{employee.name}</p>
        <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{employee.jobPosition || "—"}</p>
      </div>
      <StatusBadge status={employee.status} />
    </Link>
  );
}
