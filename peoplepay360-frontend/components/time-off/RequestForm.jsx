"use client";

import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

/**
 * Create-only — there is no PATCH endpoint for requests, only approve /
 * refuse / delete. `showEmployeeField` is false for the EMPLOYEE role since
 * the API ignores any employeeId they send and always uses their own record.
 */
export default function RequestForm({ defaultEmployeeId, showEmployeeField, saving = false, onSubmit }) {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employeeId: defaultEmployeeId ?? "",
      typeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  function submit(values) {
    const payload = { typeId: values.typeId, startDate: values.startDate, endDate: values.endDate, reason: values.reason };
    if (showEmployeeField && values.employeeId) payload.employeeId = values.employeeId;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {showEmployeeField && (
          <FormField label="Employee" htmlFor="employeeId" required error={errors.employeeId?.message}>
            <OptionsSelect
              id="employeeId"
              optionsUrl="/api/employees/options"
              placeholder="— Select employee —"
              invalid={Boolean(errors.employeeId)}
              {...register("employeeId", { required: "Employee is required" })}
            />
          </FormField>
        )}

        <FormField label="Time Off Type" htmlFor="typeId" required error={errors.typeId?.message}>
          <OptionsSelect
            id="typeId"
            optionsUrl="/api/timeoff/types/options"
            placeholder="— Select type —"
            invalid={Boolean(errors.typeId)}
            {...register("typeId", { required: "Time off type is required" })}
          />
        </FormField>

        <FormField label="Start Date" htmlFor="startDate" required error={errors.startDate?.message}>
          <Input
            id="startDate"
            type="date"
            invalid={Boolean(errors.startDate)}
            {...register("startDate", { required: "Start date is required" })}
          />
        </FormField>

        <FormField label="End Date" htmlFor="endDate" required error={errors.endDate?.message}>
          <Input
            id="endDate"
            type="date"
            invalid={Boolean(errors.endDate)}
            {...register("endDate", {
              required: "End date is required",
              validate: (value) => {
                const startDate = getValues("startDate");
                return !startDate || value >= startDate || "End date must be on or after the start date";
              },
            })}
          />
        </FormField>
      </div>

      <FormField label="Reason" htmlFor="reason">
        <Textarea id="reason" {...register("reason")} />
      </FormField>

      <div className="flex justify-end border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Button type="submit" loading={saving}>
          Submit Request
        </Button>
      </div>
    </form>
  );
}
