import Link from "next/link";
import { FileText, Clock, CalendarClock, CalendarCheck } from "lucide-react";

const BUTTONS = [
  { key: "contracts", label: "Contracts", icon: FileText, href: (id) => `/contracts?employeeId=${id}` },
  { key: "attendance", label: "Attendance", icon: Clock, href: (id) => `/attendance?employeeId=${id}` },
  { key: "timeOff", label: "Time Off", icon: CalendarClock, href: (id) => `/time-off/requests?employeeId=${id}` },
  { key: "allocations", label: "Allocations", icon: CalendarCheck, href: (id) => `/time-off/allocations?employeeId=${id}` },
];

/**
 * All four counts now come free on GET /api/employees/[id]'s
 * `smartButtonCounts` field (added in Phase 4) — no extra requests needed.
 * See Docs/api/phase-4-time-off.md "Completed pending items".
 */
export default function EmployeeSmartButtons({ employee }) {
  const counts = employee?.smartButtonCounts ?? {};

  return (
    <div className="flex flex-wrap gap-2">
      {BUTTONS.map(({ key, label, icon: Icon, href }) => (
        <Link
          key={key}
          href={href(employee?.id)}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
          <span className="rounded-full bg-indigo-100 px-1.5 text-[10px] text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
            {counts[key] ?? 0}
          </span>
        </Link>
      ))}
    </div>
  );
}
