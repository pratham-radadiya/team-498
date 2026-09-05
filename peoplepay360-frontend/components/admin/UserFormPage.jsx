"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useUser from "@/hooks/admin/useUser";
import useAuth from "@/hooks/auth/useAuth";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import UserForm from "@/components/admin/UserForm";

export default function UserFormPage({ userId }) {
  const router = useRouter();
  const mode = userId ? "edit" : "create";
  const { user, loading, error, saving, save } = useUser(userId);
  const { user: currentUser } = useAuth();
  const [saveError, setSaveError] = useState(null);

  async function handleSubmit(payload) {
    setSaveError(null);
    try {
      await save(payload);
      router.push("/admin/users");
    } catch (err) {
      setSaveError(err.message);
    }
  }

  if (mode === "edit" && loading) return <SkeletonForm fields={5} />;
  if (mode === "edit" && error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={mode === "create" ? "New User" : user?.email || "User"}
        description={mode === "create" ? "Create a user account linked to an employee." : "Update role and status."}
      />
      {saveError && <p className="text-sm text-red-600 dark:text-red-400">{saveError}</p>}
      <div className="mx-auto w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          {mode === "create" ? "Create User" : "Edit User"}
        </h2>
        <UserForm
          user={user}
          mode={mode}
          saving={saving}
          currentUserId={currentUser?.id}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
