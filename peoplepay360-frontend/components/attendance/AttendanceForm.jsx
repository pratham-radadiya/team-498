"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { ATTENDANCE_STATUS } from "@/lib/constants/attendance";

function toDateTimeLocalValue(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * View + manual-correction form. `canEdit` should only be true for
 * HR Manager+ roles (the API's own restriction) — Employee role sees this
 * as a read-only detail view.
 */
export default function AttendanceForm({ record, employeeName, saving = false, onSubmit, onDelete, canEdit = false }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: { checkIn: "", checkOut: "", status: ATTENDANCE_STATUS.PRESENT, notes: "" },
  });

  useEffect(() => {
    if (record) {
      reset({
        checkIn: toDateTimeLocalValue(record.checkIn),
        checkOut: toDateTimeLocalValue(record.checkOut),
        status: record.status ?? ATTENDANCE_STATUS.PRESENT,
        notes: record.notes ?? "",
      });
    }
  }, [record, reset]);

  function submit(values) {
    onSubmit({
      checkIn: values.checkIn ? new Date(values.checkIn).toISOString() : undefined,
      checkOut: values.checkOut ? new Date(values.checkOut).toISOString() : null,
      status: values.status,
      notes: values.notes,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Employee">
          <Input value={employeeName ?? record?.employeeId ?? ""} disabled />
        </FormField>

        <FormField label="Status" htmlFor="status">
          <Select id="status" disabled={!canEdit} {...register("status")}>
            {Object.values(ATTENDANCE_STATUS).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Check In" htmlFor="checkIn">
          <Input id="checkIn" type="datetime-local" disabled={!canEdit} {...register("checkIn")} />
        </FormField>

        <FormField
          label="Check Out"
          htmlFor="checkOut"
          hint={canEdit ? "Leave blank to re-open this session" : undefined}
        >
          <Input id="checkOut" type="datetime-local" disabled={!canEdit} {...register("checkOut")} />
        </FormField>

        <FormField label="Worked Hours" hint="Computed by the server">
          <Input value={record?.workedHours != null ? `${record.workedHours}h` : "Open session"} disabled />
        </FormField>

        <FormField label="Overtime" hint="Computed by the server">
          <Input value={record?.overtime != null ? `${record.overtime}h` : "—"} disabled />
        </FormField>
      </div>

      <FormField label="Notes" htmlFor="notes">
        <Textarea id="notes" disabled={!canEdit} {...register("notes")} />
      </FormField>

      {canEdit && (
        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div>
            {onDelete && (
              <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                Delete
              </Button>
            )}
          </div>
          <Button type="submit" loading={saving} disabled={!isDirty}>
            Save Correction
          </Button>
        </div>
      )}
    </form>
  );
}
