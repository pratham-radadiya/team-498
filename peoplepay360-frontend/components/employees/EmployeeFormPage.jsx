"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useEmployee from "@/hooks/employees/useEmployee";
import useRole from "@/hooks/auth/useRole";
import { deleteEmployee } from "@/lib/api/employeeApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmployeeForm from "@/components/employees/EmployeeForm";

export default function EmployeeFormPage({ employeeId }) {
  const router = useRouter();
  const mode = employeeId ? "edit" : "create";
  const { employee, loading, error, saving, save } = useEmployee(employeeId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("employees", "create") : can("employees", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await save(payload);
      router.push(`/employees/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteEmployee(employeeId);
      router.push("/employees");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={7} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New Employee" : employee?.name || "Employee"}
        description={mode === "create" ? "Add a new employee to the master record." : employee?.email}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <EmployeeForm
          employee={employee}
          mode={mode}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("employees", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete employee"
        description={`This will permanently delete ${employee?.name || "this employee"}.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
