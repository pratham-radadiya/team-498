"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSalaryStructure from "@/hooks/payroll/useSalaryStructure";
import useRole from "@/hooks/auth/useRole";
import { deleteSalaryStructure } from "@/lib/api/salaryStructureApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SalaryStructureForm from "@/components/payroll/SalaryStructureForm";

export default function SalaryStructureFormPage({ structureId }) {
  const router = useRouter();
  const mode = structureId ? "edit" : "create";
  const { structure, loading, error, saving, save } = useSalaryStructure(structureId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("salaryStructures", "create") : can("salaryStructures", "update");

  async function handleSubmit(values) {
    setSaveError(null);
    try {
      const result = await save(values);
      router.push(`/payroll/structures/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSalaryStructure(structureId);
      router.push("/payroll/structures");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={2} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New Salary Structure" : structure?.name || "Salary Structure"}
        description={mode === "create" ? "Create a container for salary rules." : undefined}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <SalaryStructureForm
          structure={structure}
          mode={mode}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("salaryStructures", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete salary structure"
        description={`This will permanently delete ${structure?.name || "this structure"}.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
