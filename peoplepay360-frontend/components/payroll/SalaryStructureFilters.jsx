"use client";

import { Search } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";

export default function SalaryStructureFilters({ search, onSearchChange, active, onActiveChange }) {
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
      <Select value={active} onChange={(e) => onActiveChange(e.target.value)} className="sm:w-40">
        <option value="">All</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>
    </div>
  );
}
