"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import PageHeader from "@/components/common/PageHeader";
import WorkingScheduleTable from "@/components/working-schedules/WorkingScheduleTable";

export default function WorkingSchedulesPage() {
  const { can } = useRole();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Working Schedules"
        description="Weekly work patterns used by Employees, Contracts and Attendance."
        actions={
          can("workingSchedules", "create") && (
            <Link
              href="/working-schedules/new"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Schedule
            </Link>
          )
        }
      />
      <WorkingScheduleTable />
    </div>
  );
}
