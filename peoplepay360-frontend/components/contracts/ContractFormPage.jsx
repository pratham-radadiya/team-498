"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useContract from "@/hooks/contracts/useContract";
import useRole from "@/hooks/auth/useRole";
import { deleteContract } from "@/lib/api/contractApi";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import ContractForm from "@/components/contracts/ContractForm";

export default function ContractFormPage({ contractId }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEmployeeId = searchParams.get("employeeId") || undefined;
  const mode = contractId ? "edit" : "create";
  const { contract, loading, error, saving, save } = useContract(contractId);
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const canEdit = mode === "create" ? can("contracts", "create") : can("contracts", "update");

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      const result = await save(payload);
      router.push(`/contracts/${result.id}`);
    } catch (err) {
      setSaveError(err.message);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteContract(contractId);
      router.push("/contracts");
    } catch (err) {
      setSaveError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={8} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New Contract" : "Contract"}
        description={
          mode === "create"
            ? "Set up a new employment contract."
            : `Status: ${contract?.status ?? "—"}`
        }
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <ContractForm
          contract={contract}
          mode={mode}
          defaultEmployeeId={defaultEmployeeId}
          saving={saving}
          canEdit={canEdit}
          onSubmit={handleSubmit}
          onDelete={can("contracts", "delete") ? () => setDeleteOpen(true) : undefined}
        />
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete contract"
        description="This will permanently delete this contract."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
