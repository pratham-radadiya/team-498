"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { createEmployee } from "@/lib/api/employeeApi";
import { createUser } from "@/lib/api/userApi";
import QuickAddEmployeeForm from "@/components/employees/QuickAddEmployeeForm";

/**
 * Quick "add a person" dialog: modal chrome + the two-step API call only.
 * The actual form fields live in QuickAddEmployeeForm — see that file for
 * why they're split out. On submit, this creates the Employee record
 * first, then the linked User account with that role and password — two
 * calls to the existing, documented endpoints, not a new backend
 * capability. Anything beyond these fields (department, job position,
 * working schedule, ...) is still filled in later by editing the employee
 * on the full record page.
 */
export default function EmployeeFormModal({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  // Guards against a fast double-click firing two overlapping create
  // chains — checked synchronously, unlike `saving` state.
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleCreate(values) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSaving(true);
    setSaveError(null);

    let employee;
    try {
      employee = await createEmployee({ name: values.name, email: values.email, status: values.status });
    } catch (err) {
      setSaveError(err.message);
      setSaving(false);
      submittingRef.current = false;
      return;
    }

    try {
      await createUser({
        email: values.email,
        password: values.password,
        role: values.role,
        employeeId: employee.id,
        status: values.status,
      });
    } catch (err) {
      setSaving(false);
      submittingRef.current = false;
      onSaved(employee, {
        userError: `Employee was created, but the login account failed: ${err.message}. Create it separately from User Management.`,
      });
      return;
    }

    setSaving(false);
    submittingRef.current = false;
    onSaved(employee);
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

          <h2 className="mb-6 text-xl font-semibold text-zinc-900 dark:text-zinc-100">New Employee</h2>

          {saveError && <p className="mb-4 text-sm text-red-600 dark:text-red-400">{saveError}</p>}

          <QuickAddEmployeeForm onSubmit={handleCreate} saving={saving} />
        </div>
      </div>
    </div>
  );
}
