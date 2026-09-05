"use client";

import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { ROLES, ROLE_LABELS, EMPLOYEE_STATUS } from "@/lib/constants/roles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The actual quick-add fields, deliberately kept in their own always-
 * rendering component (mounted fresh every time the parent dialog opens,
 * since the parent returns null while closed) instead of living inline
 * alongside a conditional early-return in EmployeeFormModal. That
 * co-location was the confirmed cause of a real bug: submitted values came
 * through as empty strings despite the visible inputs being filled in.
 * Every other working form here (UserForm/UserFormModal, LoginForm) keeps
 * its useForm()/fields in a component with no conditional early-return —
 * matching that structure fixed it.
 */
export default function QuickAddEmployeeForm({ onSubmit, saving }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: ROLES.EMPLOYEE,
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FormField label="Name" htmlFor="name" required error={errors.name?.message}>
        <Input id="name" invalid={Boolean(errors.name)} {...register("name", { required: "Name is required" })} />
      </FormField>

      <FormField label="Work Email" htmlFor="email" required error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          placeholder="employee@company.com"
          invalid={Boolean(errors.email)}
          {...register("email", {
            required: "Work email is required",
            pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
          })}
        />
      </FormField>

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

      <FormField label="Role" required>
        <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
          {Object.values(ROLES).map((role) => (
            <label
              key={role}
              className="flex cursor-pointer items-center gap-2 text-sm text-zinc-800 dark:text-zinc-200"
            >
              <input
                type="radio"
                value={role}
                className="h-4 w-4 border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800"
                {...register("role")}
              />
              {ROLE_LABELS[role]}
            </label>
          ))}
        </div>
      </FormField>

      <FormField label="Activity Status">
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
        Create Employee
      </Button>
    </form>
  );
}
