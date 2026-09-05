"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useWorkingSchedule from "@/hooks/workingSchedules/useWorkingSchedule";
import useRole from "@/hooks/auth/useRole";
import { deleteWorkingSchedule } from "@/lib/api/workingScheduleApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import WorkingScheduleForm from "@/components/working-schedules/WorkingScheduleForm";

export default function WorkingScheduleFormPage({ scheduleId }) {
  const router = useRouter();
  const mode = scheduleId ? "edit" : "create";
  const { schedule, loading, error, saving, save } = useWorkingSchedule(scheduleId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("workingSchedules", "create") : can("workingSchedules", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await save(payload);
      router.push(`/working-schedules/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteWorkingSchedule(scheduleId);
      router.push("/working-schedules");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={4} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New Working Schedule" : schedule?.name || "Working Schedule"}
        description={
          mode === "create"
            ? "Define a weekly work pattern — total hours are computed automatically."
            : `${schedule?.days?.length ?? 0} day(s) configured`
        }
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <WorkingScheduleForm
          schedule={schedule}
          mode={mode}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("workingSchedules", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete working schedule"
        description={`This will permanently delete ${schedule?.name || "this schedule"}.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
