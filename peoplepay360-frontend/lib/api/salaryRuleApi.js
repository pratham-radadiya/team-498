import apiClient from "@/lib/api/client";

/** Server defaults to sequence-ascending if no sortModel is given. */
export async function listSalaryRules({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/salary-rules/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

export async function getSalaryRule(id) {
  const { data } = await apiClient.get(`/api/salary-rules/${id}`);
  return data;
}

/**
 * Only the fields required for the given `computationMethod` should be sent
 * — the API's own validator is conditional on it, per
 * Docs/api/phase-5-salary.md.
 */
export async function createSalaryRule(payload) {
  const { data } = await apiClient.post("/api/salary-rules", payload);
  return data;
}

export async function updateSalaryRule(id, payload) {
  const { data } = await apiClient.patch(`/api/salary-rules/${id}`, payload);
  return data;
}

export async function deleteSalaryRule(id) {
  await apiClient.delete(`/api/salary-rules/${id}`);
}
