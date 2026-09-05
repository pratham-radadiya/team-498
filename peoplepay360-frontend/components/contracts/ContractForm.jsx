"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import useRole from "@/hooks/auth/useRole";
import { CONTRACT_STATUS } from "@/lib/constants/contract";

function toDateInputValue(value) {
  return value ? value.slice(0, 10) : "";
}

export default function ContractForm({
  contract,
  mode = "create",
  defaultEmployeeId,
  saving = false,
  onSubmit,
  onDelete,
  canEdit = true,
}) {
  const { can } = useRole();
  const canPickSalaryStructure = can("salaryStructures", "read");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      employeeId: defaultEmployeeId ?? "",
      department: "",
      jobPosition: "",
      startDate: "",
      endDate: "",
      wage: "",
      workingScheduleId: "",
      salaryStructureId: "",
      status: CONTRACT_STATUS.RUNNING,
      notes: "",
    },
  });

  useEffect(() => {
    if (contract) {
      reset({
        employeeId: contract.employeeId ?? "",
        department: contract.department ?? "",
        jobPosition: contract.jobPosition ?? "",
        startDate: toDateInputValue(contract.startDate),
        endDate: toDateInputValue(contract.endDate),
        wage: contract.wage ?? "",
        workingScheduleId: contract.workingScheduleId ?? "",
        salaryStructureId: contract.salaryStructureId ?? "",
        status: contract.status ?? CONTRACT_STATUS.RUNNING,
        notes: contract.notes ?? "",
      });
    }
  }, [contract, reset]);

  function submit(values) {
    onSubmit({
      ...values,
      endDate: values.endDate || null,
      wage: Number(values.wage),
      workingScheduleId: values.workingScheduleId || null,
      // When this role can't see the picker, the field is never registered
      // with RHF — fall back to whatever was already there instead of
      // wiping it out with an absent/undefined value.
      salaryStructureId: canPickSalaryStructure ? values.salaryStructureId || null : (contract?.salaryStructureId ?? null),
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

        <FormField label="Department" htmlFor="department">
          <Input id="department" disabled={!canEdit} {...register("department")} />
        </FormField>

        <FormField label="Job Position" htmlFor="jobPosition">
          <Input id="jobPosition" disabled={!canEdit} {...register("jobPosition")} />
        </FormField>

        <FormField label="Wage/Month" htmlFor="wage" required error={errors.wage?.message}>
          <Input
            id="wage"
            type="number"
            min="0"
            step="0.01"
            disabled={!canEdit}
            invalid={Boolean(errors.wage)}
            {...register("wage", { required: "Wage is required", min: { value: 0.01, message: "Wage must be greater than 0" } })}
          />
        </FormField>

        <FormField label="Start Date" htmlFor="startDate" required error={errors.startDate?.message}>
          <Input
            id="startDate"
            type="date"
            disabled={!canEdit}
            invalid={Boolean(errors.startDate)}
            {...register("startDate", { required: "Start date is required" })}
          />
        </FormField>

        <FormField label="End Date" htmlFor="endDate" hint="Leave blank if still ongoing">
          <Input id="endDate" type="date" disabled={!canEdit} {...register("endDate")} />
        </FormField>

        <FormField label="Working Schedule" htmlFor="workingScheduleId">
          <OptionsSelect
            id="workingScheduleId"
            optionsUrl="/api/working-schedules/options"
            placeholder="— No schedule —"
            disabled={!canEdit}
            {...register("workingScheduleId")}
          />
        </FormField>

        <FormField
          label="Salary Structure"
          htmlFor="salaryStructureId"
          hint={
            canPickSalaryStructure
              ? undefined
              : "Only HR Payroll roles can view/set the Salary Structure — see Docs/api/phase-5-salary.md's flagged friction"
          }
        >
          {canPickSalaryStructure ? (
            <OptionsSelect
              id="salaryStructureId"
              optionsUrl="/api/salary-structures/options"
              placeholder="— No structure —"
              disabled={!canEdit}
              {...register("salaryStructureId")}
            />
          ) : (
            <Input id="salaryStructureId" value={contract?.salaryStructureId ?? ""} disabled />
          )}
        </FormField>

        <FormField label="Status" htmlFor="status">
          <Select id="status" disabled={!canEdit} {...register("status")}>
            {Object.values(CONTRACT_STATUS).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea id="notes" disabled={!canEdit} {...register("notes")} />
      </FormField>

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
