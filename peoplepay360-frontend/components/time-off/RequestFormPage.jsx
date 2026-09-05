"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useTimeOffRequest from "@/hooks/timeOff/useTimeOffRequest";
import useRole from "@/hooks/auth/useRole";
import { ROLES } from "@/lib/constants/roles";
import PageHeader from "@/components/common/PageHeader";
import RequestForm from "@/components/time-off/RequestForm";

export default function RequestFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmployeeId = searchParams.get("employeeId") || undefined;
  const { create, saving } = useTimeOffRequest();
  const { isRole } = useRole();
  const [saveError, setSaveError] = useState(null);

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await create(payload);
      router.push(`/time-off/requests/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="New Time Off Request" description="The allocation used, if any, is chosen by the server." />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <RequestForm
          defaultEmployeeId={defaultEmployeeId}
          showEmployeeField={!isRole(ROLES.EMPLOYEE)}
          saving={saving}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
