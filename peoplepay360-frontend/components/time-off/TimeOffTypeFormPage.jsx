"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useTimeOffType from "@/hooks/timeOff/useTimeOffType";
import useRole from "@/hooks/auth/useRole";
import { deleteTimeOffType } from "@/lib/api/timeOffTypeApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import TimeOffTypeForm from "@/components/time-off/TimeOffTypeForm";

export default function TimeOffTypeFormPage({ typeId }) {
  const router = useRouter();
  const mode = typeId ? "edit" : "create";
  const { type, loading, error, saving, save } = useTimeOffType(typeId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("timeOffTypes", "create") : can("timeOffTypes", "update");

  async function handleSubmit(values) {
    setSaveError(null);
    try {
      const result = await save(values);
      router.push(`/time-off/types/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTimeOffType(typeId);
      router.push("/time-off/types");
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
        title={mode === "create" ? "New Time Off Type" : type?.name || "Time Off Type"}
        description={mode === "create" ? "Define a leave policy." : undefined}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <TimeOffTypeForm
          type={type}
          mode={mode}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("timeOffTypes", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete time off type"
        description={`This will permanently delete ${type?.name || "this type"}.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
