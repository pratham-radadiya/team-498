"use client";

import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { EMPLOYEE_STATUS } from "@/lib/constants/roles";

export default function EmployeeFilters({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  status,
  onStatusChange,
  showDepartmentFilter = true,
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by name..."
          className="pl-9"
        />
      </div>
      {showDepartmentFilter && (
        <Input
          value={department}
          onChange={(e) => onDepartmentChange(e.target.value)}
          placeholder="Department"
          className="sm:w-48"
        />
      )}
      <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-40">
        <option value="">All statuses</option>
        {Object.values(EMPLOYEE_STATUS).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
}
