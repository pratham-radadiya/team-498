"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import useRole from "@/hooks/auth/useRole";
import PageHeader from "@/components/common/PageHeader";
import SalaryRuleTable from "@/components/payroll/SalaryRuleTable";

export default function SalaryRulesPage() {
  const { can } = useRole();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Salary Rules"
        description="Computable components — sequence determines execution order."
        actions={
          can("salaryRules", "create") && (
            <Link
              href="/payroll/rules/new"
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Rule
            </Link>
          )
        }
      />
      <SalaryRuleTable />
    </div>
  );
}
