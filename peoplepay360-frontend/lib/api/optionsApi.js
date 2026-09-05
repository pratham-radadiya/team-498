import apiClient from "@/lib/api/client";

/**
 * Generic {id,label}[] fetch for any lightweight dropdown/options endpoint
 * (Employee, Working Schedule, ...). Backs the shared OptionsSelect field —
 * see Docs/api/phase-2-working-schedule-contract.md's shared-picker note.
 */
export async function getOptions(url) {
  const { data } = await apiClient.get(url);
  return data;
}
