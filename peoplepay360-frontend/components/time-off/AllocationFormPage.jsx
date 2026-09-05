"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAllocation from "@/hooks/timeOff/useAllocation";
import useRole from "@/hooks/auth/useRole";
import { deleteAllocation } from "@/lib/api/allocationApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AllocationForm from "@/components/time-off/AllocationForm";

export default function AllocationFormPage({ allocationId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmployeeId = searchParams.get("employeeId") || undefined;
  const mode = allocationId ? "edit" : "create";
  const { allocation, loading, error, saving, save } = useAllocation(allocationId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("allocations", "create") : can("allocations", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await save(payload);
      router.push(`/time-off/allocations/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAllocation(allocationId);
      router.push("/time-off/allocations");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={6} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New Allocation" : "Allocation"}
        description={mode === "create" ? "Grant a leave balance to an employee." : `Status: ${allocation?.status ?? "—"}`}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <AllocationForm
          allocation={allocation}
          mode={mode}
          defaultEmployeeId={defaultEmployeeId}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("allocations", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete allocation"
        description="This will permanently delete this allocation."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
