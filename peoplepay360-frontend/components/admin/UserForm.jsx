"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ROLES, ROLE_LABELS, EMPLOYEE_STATUS } from "@/lib/constants/roles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UserForm({
  user,
  mode = "create",
  saving = false,
  currentUserId,
  onSubmit,
}) {
  const isSelf = mode === "edit" && user && currentUserId && user.id === currentUserId;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
      role: ROLES.EMPLOYEE,
      employeeId: "",
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        email: user.email ?? "",
        password: "",
        role: user.role ?? ROLES.EMPLOYEE,
        employeeId: user.employeeId ?? "",
        status: user.status ?? EMPLOYEE_STATUS.ACTIVE,
      });
    }
  }, [user, reset]);

  function submit(values) {
    if (mode === "edit") {
      const payload = { status: values.status };
      if (!isSelf) payload.role = values.role;
      onSubmit(payload);
      return;
    }
    onSubmit(values);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <FormField label="Employee" htmlFor="employeeId" required error={errors.employeeId?.message}>
        <OptionsSelect
          id="employeeId"
          optionsUrl="/api/employees/options"
          placeholder="Select employee"
          disabled={mode === "edit"}
          {...register("employeeId", { required: "Linked employee is required" })}
        />
      </FormField>

      <FormField label="Work Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="employee@company.com"
          disabled={mode === "edit"}
          invalid={Boolean(errors.email)}
          {...register("email", {
            required: "Work email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          })}
        />
      </FormField>

      {mode === "create" && (
        <FormField label="Password" htmlFor="password" required error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            invalid={Boolean(errors.password)}
            {...register("password", {
              required: "Password is required",
              minLength: { value: 8, message: "Must be at least 8 characters" },
            })}
          />
        </FormField>
      )}

      <FormField label="Role" hint={isSelf ? "You cannot change your own role" : undefined} required>
        <div className="flex flex-col gap-3 pt-1">
          {Object.values(ROLES).map((role) => (
            <label
              key={role}
              className={`flex items-center gap-3 text-sm text-zinc-800 dark:text-zinc-200 ${
                isSelf ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                value={role}
                disabled={isSelf}
                className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800"
                {...register("role")}
              />
              {ROLE_LABELS[role]}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Account Status">
        <div className="flex gap-2 pt-1">
          {Object.values(EMPLOYEE_STATUS).map((value) => (
            <label key={value} className="cursor-pointer">
              <input type="radio" value={value} className="peer sr-only" {...register("status")} />
              <span className="block rounded-md border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-600 transition-colors peer-checked:border-indigo-600 peer-checked:text-indigo-700 peer-checked:ring-1 peer-checked:ring-indigo-600 dark:border-zinc-700 dark:text-zinc-400 dark:peer-checked:border-indigo-500 dark:peer-checked:text-indigo-400 dark:peer-checked:ring-indigo-500">
                {value}
              </span>
            </label>
          ))}
        </div>
      </FormField>

      <Button type="submit" loading={saving} className="mt-2 w-full py-3 text-base">
        {mode === "create" ? "Create User" : "Save Access"}
      </Button>
    </form>
  );
}
