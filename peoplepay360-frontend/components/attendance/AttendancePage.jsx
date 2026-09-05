"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { getEmployee } from "@/lib/api/employeeApi";
import PageHeader from "@/components/common/PageHeader";
import AttendanceTable from "@/components/attendance/AttendanceTable";

export default function AttendancePage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId") || undefined;
  const [employeeName, setEmployeeName] = useState(null);

  useEffect(() => {
    if (!employeeId) {
      setEmployeeName(null);
      return;
    }
    let cancelled = false;
    getEmployee(employeeId)
      .then((data) => {
        if (!cancelled) setEmployeeName(data.name);
      })
      .catch(() => {
        if (!cancelled) setEmployeeName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Attendance"
        description="Check-in/check-out history — records are created from the Attendance quick-action widget."
      />

      {employeeId && (
        <div className="flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
          <span>Showing attendance for {employeeName || "this employee"}</span>
          <Link href="/attendance" className="flex items-center gap-1 font-medium hover:underline">
            <X className="h-3.5 w-3.5" />
            Clear filter
          </Link>
        </div>
      )}

      <AttendanceTable employeeId={employeeId} />
    </div>
  );
}
