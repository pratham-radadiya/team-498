import apiClient from "@/lib/api/client";

/**
 * Grid request shape per Docs/api/phase-2-working-schedule-contract.md:
 * { startRow, endRow, sortModel: [{colId, sort}], filterModel: {...} }
 */
export async function listContracts({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/contracts/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

/** Scoped grid backing an Employee Form's "Contracts N" smart button. */
export async function listEmployeeContracts(employeeId, { startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post(`/api/employees/${employeeId}/contracts`, {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data;
}

export async function getContract(id) {
  const { data } = await apiClient.get(`/api/contracts/${id}`);
  return data;
}

export async function createContract(payload) {
  const { data } = await apiClient.post("/api/contracts", payload);
  return data;
}

export async function updateContract(id, payload) {
  const { data } = await apiClient.patch(`/api/contracts/${id}`, payload);
  return data;
}

export async function deleteContract(id) {
  await apiClient.delete(`/api/contracts/${id}`);
}
