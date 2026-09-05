"use client";

import Select from "@/components/ui/Select";
import { CONTRACT_STATUS } from "@/lib/constants/contract";

export default function ContractFilters({ status, onStatusChange }) {
  return (
    <div className="flex items-center gap-2">
      <Select value={status} onChange={(e) => onStatusChange(e.target.value)} className="sm:w-48">
        <option value="">All statuses</option>
        {Object.values(CONTRACT_STATUS).map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
}
