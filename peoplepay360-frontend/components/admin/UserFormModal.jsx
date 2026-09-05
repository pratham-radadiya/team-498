"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import useUser from "@/hooks/admin/useUser";
import useAuth from "@/hooks/auth/useAuth";
import Skeleton from "@/components/ui/Skeleton";
import ErrorState from "@/components/common/ErrorState";
import UserForm from "@/components/admin/UserForm";

/**
 * In-context dialog for creating/editing a User account, opened from the
 * Users list instead of navigating to /admin/users/new — reuses the same
 * useUser hook and UserForm component as the standalone route so there's
 * only one copy of the form fields/validation/save logic.
 */
export default function UserFormModal({ open, userId, onClose, onSaved }) {
  const mode = userId ? "edit" : "create";
  const { user, loading, error, saving, save } = useUser(open ? userId : undefined);
  const { user: currentUser } = useAuth();
  const [saveError, setSaveError] = useState(null);
  // `saving` (from useUser) updates asynchronously, so a fast double-click
  // on Submit can fire this handler twice before the button disables — this
  // ref is checked synchronously, closing that race window.
  const submittingRef = useRef(false);

  // Split from the Escape-key effect below: `onClose` is a new function
  // reference on every render of the parent (defined inline there), so
  // depending on it here would clear the error banner on any unrelated
  // parent re-render while the dialog is open — same class of bug fixed in
  // EmployeeFormModal.
  useEffect(() => {
    if (!open) return;
    setSaveError(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(payload) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaveError(null);
    try {
      const result = await save(payload);
      onSaved(result);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-zinc-900/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <div className="relative my-8 w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {mode === "create" ? "Create User" : "Edit User"}
          </h2>

          {saveError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{saveError}</p>}

          {mode === "edit" && loading ? (
            <div className="flex flex-col gap-6" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
              <Skeleton className="h-11 w-full" />
            </div>
          ) : mode === "edit" && error ? (
            <ErrorState message={error.message} />
          ) : (
            <UserForm
              user={user}
              mode={mode}
              saving={saving}
              currentUserId={currentUser?.id}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
