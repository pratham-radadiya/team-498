"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSalaryRule from "@/hooks/payroll/useSalaryRule";
import useRole from "@/hooks/auth/useRole";
import { deleteSalaryRule } from "@/lib/api/salaryRuleApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SalaryRuleForm from "@/components/payroll/SalaryRuleForm";

export default function SalaryRuleFormPage({ ruleId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultStructureId = searchParams.get("structureId") || undefined;
  const mode = ruleId ? "edit" : "create";
  const { rule, loading, error, saving, save } = useSalaryRule(ruleId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("salaryRules", "create") : can("salaryRules", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await save(payload);
      router.push(`/payroll/rules/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteSalaryRule(ruleId);
      router.push("/payroll/rules");
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
        title={mode === "create" ? "New Salary Rule" : rule?.name || "Salary Rule"}
        description={mode === "create" ? "Add a computable component to a Salary Structure." : `Sequence ${rule?.sequence ?? "—"}`}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <SalaryRuleForm
          rule={rule}
          mode={mode}
          defaultStructureId={defaultStructureId}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("salaryRules", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete salary rule"
        description={`This will permanently delete ${rule?.name || "this rule"}.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
