"use client";

import Select from "@/components/ui/Select";
import { SALARY_CATEGORY } from "@/lib/constants/salary";

export default function SalaryRuleFilters({ structureId, onStructureChange, structureOptions, category, onCategoryChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <Select value={structureId} onChange={(e) => onStructureChange(e.target.value)} className="sm:w-56">
        <option value="">All structures</option>
        {structureOptions.map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </Select>
      <Select value={category} onChange={(e) => onCategoryChange(e.target.value)} className="sm:w-44">
        <option value="">All categories</option>
        {Object.values(SALARY_CATEGORY).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
}
