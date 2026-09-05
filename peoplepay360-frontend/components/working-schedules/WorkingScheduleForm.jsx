"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { EMPLOYEE_STATUS } from "@/lib/constants/roles";
import { WEEK_DAYS, WEEK_DAY_LABELS } from "@/lib/constants/workingSchedule";

const EMPTY_DAY = { day: "MON", startTime: "09:00", endTime: "18:00", breakMinutes: 0 };

export default function WorkingScheduleForm({
  schedule,
  mode = "create",
  saving = false,
  onSubmit,
  onDelete,
  canEdit = true,
}) {
  const [daysError, setDaysError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      name: "",
      calendarType: "",
      company: "",
      status: EMPLOYEE_STATUS.ACTIVE,
      days: [EMPTY_DAY],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "days" });

  useEffect(() => {
    if (schedule) {
      reset({
        name: schedule.name ?? "",
        calendarType: schedule.calendarType ?? "",
        company: schedule.company ?? "",
        status: schedule.status ?? EMPLOYEE_STATUS.ACTIVE,
        days: (schedule.days ?? [EMPTY_DAY]).map(({ day, startTime, endTime, breakMinutes }) => ({
          day,
          startTime,
          endTime,
          breakMinutes: breakMinutes ?? 0,
        })),
      });
    }
  }, [schedule, reset]);

  function submit(values) {
    if (!values.days || values.days.length === 0) {
      setDaysError("Add at least one working day.");
      return;
    }
    setDaysError(null);
    onSubmit({
      ...values,
      days: values.days.map((d) => ({ ...d, breakMinutes: Number(d.breakMinutes) || 0 })),
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Schedule Name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            disabled={!canEdit}
            invalid={Boolean(errors.name)}
            {...register("name", { required: "Schedule name is required" })}
          />
        </FormField>

        <FormField label="Calendar Type" htmlFor="calendarType">
          <Input id="calendarType" disabled={!canEdit} placeholder="e.g. Standard, Night Shift" {...register("calendarType")} />
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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Weekly Pattern</h3>
          {canEdit && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(EMPTY_DAY)}
            >
              <Plus className="h-4 w-4" />
              Add Day
            </Button>
          )}
        </div>

        <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Day</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Start Time</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">End Time</th>
                <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Break (min)</th>
                {canEdit && <th className="px-3 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td className="px-3 py-2">
                    <Select disabled={!canEdit} {...register(`days.${index}.day`)}>
                      {WEEK_DAYS.map((d) => (
                        <option key={d} value={d}>
                          {WEEK_DAY_LABELS[d]}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="time"
                      disabled={!canEdit}
                      {...register(`days.${index}.startTime`, { required: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="time"
                      disabled={!canEdit}
                      {...register(`days.${index}.endTime`, { required: true })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min="0"
                      disabled={!canEdit}
                      {...register(`days.${index}.breakMinutes`)}
                    />
                  </td>
                  {canEdit && (
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                        className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                        aria-label="Remove day"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {daysError && <p className="text-xs text-red-600 dark:text-red-400">{daysError}</p>}
      </div>

      {schedule?.days?.length > 0 && (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Weekly Hours Summary</h3>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Computed by the server — never recalculated in the browser.</p>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            {schedule.days.map((d) => (
              <div key={`${d.day}-${d.startTime}`} className="flex justify-between rounded-md bg-white px-3 py-1.5 ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
                <dt className="text-zinc-500 dark:text-zinc-400">{WEEK_DAY_LABELS[d.day] ?? d.day}</dt>
                <dd className="font-medium text-zinc-900 dark:text-zinc-100">{d.hours}h</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Total Weekly Hours: {schedule.totalWeeklyHours}h
          </p>
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
