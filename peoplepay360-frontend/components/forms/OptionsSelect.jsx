"use client";

import { forwardRef, useEffect, useState } from "react";
import { getOptions } from "@/lib/api/optionsApi";
import Select from "@/components/ui/Select";

/**
 * Shared dropdown for any {id,label}[] options endpoint. Fetches
 * `optionsUrl` once on mount — the same component backs the Employee Form's
 * Manager field and the Contract Form's Employee/Working Schedule fields,
 * per Docs/api/phase-2-working-schedule-contract.md.
 */
const OptionsSelect = forwardRef(function OptionsSelect(
  { optionsUrl, excludeId, placeholder = "— Select —", disabled, ...selectProps },
  ref
) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getOptions(optionsUrl)
      .then((data) => {
        if (!cancelled) setOptions(data);
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [optionsUrl]);

  const filtered = excludeId ? options.filter((o) => o.id !== excludeId) : options;

  return (
    <Select ref={ref} disabled={disabled || loading} {...selectProps}>
      <option value="">{loading ? "Loading..." : placeholder}</option>
      {filtered.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </Select>
  );
});

export default OptionsSelect;
