"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import PageHeader from "@/components/common/PageHeader";
import TimeOffTypeTable from "@/components/time-off/TimeOffTypeTable";

export default function TimeOffTypesPage() {
  const { can } = useRole();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Time Off Types"
        description="Leave policy definitions — unit, approval role, and whether an allocation is required."
        actions={
          can("timeOffTypes", "create") && (
            <Link
              href="/time-off/types/new"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Type
            </Link>
          )
        }
      />
      <TimeOffTypeTable />
    </div>
  );
}
