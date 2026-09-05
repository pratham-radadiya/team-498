"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { EMPLOYEE_STATUS } from "@/lib/constants/roles";
import { TIME_OFF_UNIT, APPROVAL_ROLE } from "@/lib/constants/timeOff";

export default function TimeOffTypeForm({ type, mode = "create", saving = false, onSubmit, onDelete, canEdit = true }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      unit: TIME_OFF_UNIT.DAYS,
      requiresAllocation: true,
      approvalRole: APPROVAL_ROLE.MANAGER,
      payrollWorkEntry: "",
      color: "",
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  useEffect(() => {
    if (type) {
      reset({
        name: type.name ?? "",
        unit: type.unit ?? TIME_OFF_UNIT.DAYS,
        requiresAllocation: type.requiresAllocation ?? true,
        approvalRole: type.approvalRole ?? APPROVAL_ROLE.MANAGER,
        payrollWorkEntry: type.payrollWorkEntry ?? "",
        color: type.color ?? "",
        status: type.status ?? EMPLOYEE_STATUS.ACTIVE,
      });
    }
  }, [type, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Type Name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            disabled={!canEdit}
            invalid={Boolean(errors.name)}
            {...register("name", { required: "Type name is required" })}
          />
        </FormField>

        <FormField label="Unit" htmlFor="unit">
          <Select id="unit" disabled={!canEdit} {...register("unit")}>
            {Object.values(TIME_OFF_UNIT).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Approval" htmlFor="approvalRole">
          <Select id="approvalRole" disabled={!canEdit} {...register("approvalRole")}>
            {Object.values(APPROVAL_ROLE).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Display Color" htmlFor="color">
          <Input id="color" placeholder="e.g. Blue" disabled={!canEdit} {...register("color")} />
        </FormField>

        <FormField
          label="Payroll / Work Entry"
          htmlFor="payrollWorkEntry"
          hint="Payroll integration hook — not wired until Phase 6"
        >
          <Input id="payrollWorkEntry" placeholder="e.g. Leave Work Entry" disabled={!canEdit} {...register("payrollWorkEntry")} />
        </FormField>

        <FormField label="Status" htmlFor="status">
          <Select id="status" disabled={!canEdit} {...register("status")}>
            {Object.values(EMPLOYEE_STATUS).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            disabled={!canEdit}
            className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800"
            {...register("requiresAllocation")}
          />
          Requires Allocation
        </label>
      </div>

      {canEdit && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div>
            {mode === "edit" && onDelete && (
              <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <Button type="submit" loading={saving} disabled={mode === "edit" && !isDirty}>
            Save
          </Button>
        </div>
      )}
    </form>
  );
}
