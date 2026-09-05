import apiClient from "@/lib/api/client";

/**
 * Grid request shape per Docs/api/phase-1-employee-user.md:
 * { startRow, endRow, sortModel: [{colId, sort}], filterModel: {...} }
 */
export async function listEmployees({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/employees/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

export async function getEmployee(id) {
  const { data } = await apiClient.get(`/api/employees/${id}`);
  return data;
}

export async function createEmployee(payload) {
  const { data } = await apiClient.post("/api/employees", payload);
  return data;
}

export async function updateEmployee(id, payload) {
  const { data } = await apiClient.patch(`/api/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id) {
  await apiClient.delete(`/api/employees/${id}`);
}
