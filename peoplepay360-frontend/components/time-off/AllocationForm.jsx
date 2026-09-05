"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { TIME_OFF_STATUS } from "@/lib/constants/timeOff";

function toDateInputValue(value) {
  return value ? value.slice(0, 10) : "";
}

export default function AllocationForm({
  allocation,
  mode = "create",
  defaultEmployeeId,
  saving = false,
  onSubmit,
  onDelete,
  canEdit = true,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      employeeId: defaultEmployeeId ?? "",
      typeId: "",
      allocated: "",
      description: "",
      validFrom: "",
      validTo: "",
      status: TIME_OFF_STATUS.PENDING,
    },
  });

  useEffect(() => {
    if (allocation) {
      reset({
        employeeId: allocation.employeeId ?? "",
        typeId: allocation.typeId ?? "",
        allocated: allocation.allocated ?? "",
        description: allocation.description ?? "",
        validFrom: toDateInputValue(allocation.validFrom),
        validTo: toDateInputValue(allocation.validTo),
        status: allocation.status ?? TIME_OFF_STATUS.PENDING,
      });
    }
  }, [allocation, reset]);

  function submit(values) {
    onSubmit({
      ...values,
      allocated: Number(values.allocated),
      validFrom: values.validFrom || null,
      validTo: values.validTo || null,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Employee" htmlFor="employeeId" required error={errors.employeeId?.message}>
          <OptionsSelect
            id="employeeId"
            optionsUrl="/api/employees/options"
            placeholder="— Select employee —"
            disabled={!canEdit || mode === "edit"}
            invalid={Boolean(errors.employeeId)}
            {...register("employeeId", { required: "Employee is required" })}
          />
        </FormField>

        <FormField label="Time Off Type" htmlFor="typeId" required error={errors.typeId?.message}>
          <OptionsSelect
            id="typeId"
            optionsUrl="/api/timeoff/types/options"
            placeholder="— Select type —"
            disabled={!canEdit || mode === "edit"}
            invalid={Boolean(errors.typeId)}
            {...register("typeId", { required: "Time off type is required" })}
          />
        </FormField>

        <FormField label="Allocated" htmlFor="allocated" required error={errors.allocated?.message}>
          <Input
            id="allocated"
            type="number"
            min="0"
            step="0.5"
            disabled={!canEdit}
            invalid={Boolean(errors.allocated)}
            {...register("allocated", { required: "Allocated amount is required", min: { value: 0.01, message: "Must be greater than 0" } })}
          />
        </FormField>

        <FormField label="Status" htmlFor="status">
          <Select id="status" disabled={!canEdit} {...register("status")}>
            {Object.values(TIME_OFF_STATUS).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Valid From" htmlFor="validFrom">
          <Input id="validFrom" type="date" disabled={!canEdit} {...register("validFrom")} />
        </FormField>

        <FormField label="Valid To" htmlFor="validTo">
          <Input id="validTo" type="date" disabled={!canEdit} {...register("validTo")} />
        </FormField>
      </div>

      <FormField label="Description" htmlFor="description" hint='e.g. "2026 Annual Balance"'>
        <Input id="description" disabled={!canEdit} {...register("description")} />
      </FormField>

      {allocation && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm sm:grid-cols-3 dark:border-zinc-800 dark:bg-zinc-800/50">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Taken</dt>
            <dd className="font-semibold text-zinc-900 dark:text-zinc-100">{allocation.taken ?? 0}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Remaining</dt>
            <dd className="font-semibold text-zinc-900 dark:text-zinc-100">{allocation.remaining}</dd>
          </div>
        </div>
      )}

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
