"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import EmployeeSmartButtons from "@/components/employees/EmployeeSmartButtons";
import { EMPLOYEE_STATUS } from "@/lib/constants/roles";

const TABS = { WORK: "work", PRIVATE: "private" };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmployeeForm({
  employee,
  mode = "create",
  saving = false,
  onSubmit,
  onDelete,
  canEdit = true,
}) {
  const [tab, setTab] = useState(TABS.WORK);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      department: "",
      jobPosition: "",
      workLocation: "",
      company: "",
      bankAccount: "",
      workingScheduleId: "",
      status: EMPLOYEE_STATUS.ACTIVE,
    },
  });

  useEffect(() => {
    if (employee) {
      reset({
        name: employee.name ?? "",
        email: employee.email ?? "",
        department: employee.department ?? "",
        jobPosition: employee.jobPosition ?? "",
        workLocation: employee.workLocation ?? "",
        company: employee.company ?? "",
        bankAccount: employee.bankAccount ?? "",
        workingScheduleId: employee.workingScheduleId ?? "",
        status: employee.status ?? EMPLOYEE_STATUS.ACTIVE,
      });
    }
  }, [employee, reset]);

  function submit(values) {
    const payload = { ...values };
    if (!payload.workingScheduleId) payload.workingScheduleId = null;
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Avatar name={employee?.name || "New Employee"} />
        <div className="flex-1">
          <Input
            placeholder="Employee name"
            disabled={!canEdit}
            invalid={Boolean(errors.name)}
            className="text-base font-semibold"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        {mode === "edit" && <EmployeeSmartButtons employee={employee} />}
      </div>

      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="-mb-px flex gap-4">
          {[
            { id: TABS.WORK, label: "Work Information" },
            { id: TABS.PRIVATE, label: "Private Information" },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 px-1 py-2 text-sm font-medium ${
                tab === t.id
                  ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === TABS.WORK ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Work Location" htmlFor="workLocation">
            <Input id="workLocation" disabled={!canEdit} {...register("workLocation")} />
          </FormField>

          <FormField label="Department" htmlFor="department">
            <Input id="department" disabled={!canEdit} {...register("department")} />
          </FormField>

          <FormField label="Job Position" htmlFor="jobPosition">
            <Input id="jobPosition" disabled={!canEdit} {...register("jobPosition")} />
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

          <FormField label="Company" htmlFor="company">
            <Input id="company" disabled={!canEdit} {...register("company")} />
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
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Work Email" htmlFor="email" required error={errors.email?.message}>
            <Input
              id="email"
              type="email"
              disabled={!canEdit}
              invalid={Boolean(errors.email)}
              {...register("email", {
                required: "Work email is required",
                pattern: { value: EMAIL_PATTERN, message: "Enter a valid email address" },
              })}
            />
          </FormField>

          <FormField label="Bank Account" htmlFor="bankAccount">
            <Input id="bankAccount" disabled={!canEdit} {...register("bankAccount")} />
          </FormField>
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
