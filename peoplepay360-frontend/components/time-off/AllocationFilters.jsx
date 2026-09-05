"use client";

import Select from "@/components/ui/Select";
import { TIME_OFF_STATUS } from "@/lib/constants/timeOff";

export default function AllocationFilters({ status, onStatusChange }) {
  return (
    <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-48">
      <option value="">All statuses</option>
      {Object.values(TIME_OFF_STATUS).map((value) => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </Select>
  );
}
