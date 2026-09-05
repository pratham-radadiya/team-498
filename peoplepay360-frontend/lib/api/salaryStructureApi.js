import apiClient from "@/lib/api/client";

export async function listSalaryStructures({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/salary-structures/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount } — rows include ruleCount/employeeCount
}

/** Includes the ordered rules[] — the Structure Form's read-only rule list comes from here. */
export async function getSalaryStructure(id) {
  const { data } = await apiClient.get(`/api/salary-structures/${id}`);
  return data;
}

export async function createSalaryStructure(payload) {
  const { data } = await apiClient.post("/api/salary-structures", payload);
  return data;
}

export async function updateSalaryStructure(id, payload) {
  const { data } = await apiClient.patch(`/api/salary-structures/${id}`, payload);
  return data;
}

export async function deleteSalaryStructure(id) {
  await apiClient.delete(`/api/salary-structures/${id}`);
}
