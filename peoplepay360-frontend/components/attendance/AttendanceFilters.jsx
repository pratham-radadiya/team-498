"use client";

import Select from "@/components/ui/Select";
import { ATTENDANCE_STATUS } from "@/lib/constants/attendance";

export default function AttendanceFilters({ status, onStatusChange }) {
  return (
    <div className="flex items-center gap-2">
      <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-48">
        <option value="">All statuses</option>
        {Object.values(ATTENDANCE_STATUS).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
}
