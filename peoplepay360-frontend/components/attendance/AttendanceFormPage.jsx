"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useAttendance from "@/hooks/attendance/useAttendance";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import useRole from "@/hooks/auth/useRole";
import { deleteAttendance } from "@/lib/api/attendanceApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import AttendanceForm from "@/components/attendance/AttendanceForm";

export default function AttendanceFormPage({ attendanceId }) {
  const router = useRouter();
  const { record, loading, error, saving, save } = useAttendance(attendanceId);
  const employeeNames = useEmployeeOptionsMap();
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = can("attendance", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      await save(payload);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteAttendance(attendanceId);
      router.push("/attendance");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) return <SkeletonForm fields={6} />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Attendance Record" description={record ? `Status: ${record.status}` : undefined} />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <AttendanceForm
          record={record}
          employeeName={record ? employeeNames.get(record.employeeId) : undefined}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("attendance", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete attendance record"
        description="This will permanently delete this attendance record."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
