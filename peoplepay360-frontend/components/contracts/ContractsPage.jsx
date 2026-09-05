"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, X } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import { getEmployee } from "@/lib/api/employeeApi";
import PageHeader from "@/components/common/PageHeader";
import ContractTable from "@/components/contracts/ContractTable";

export default function ContractsPage() {
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("employeeId") || undefined;
  const { can } = useRole();
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
        title="Contracts"
        description="Contract history — the active Running contract is the one payroll uses."
        actions={
          can("contracts", "create") && (
            <Link
              href={employeeId ? `/contracts/new?employeeId=${employeeId}` : "/contracts/new"}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Contract
            </Link>
          )
        }
      />

      {employeeId && (
        <div className="flex items-center justify-between rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300">
          <span>Showing contracts for {employeeName || "this employee"}</span>
          <Link href="/contracts" className="flex items-center gap-1 font-medium hover:underline">
            <X className="h-3.5 w-3.5" />
            Clear filter
          </Link>
        </div>
      )}

      <ContractTable employeeId={employeeId} />
    </div>
  );
}
