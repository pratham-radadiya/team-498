import apiClient from "@/lib/api/client";

export async function listAllocations({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/timeoff/allocations/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount } — rows already carry a computed `remaining`
}

export async function getAllocation(id) {
  const { data } = await apiClient.get(`/api/timeoff/allocations/${id}`);
  return data;
}

export async function createAllocation(payload) {
  const { data } = await apiClient.post("/api/timeoff/allocations", payload);
  return data;
}

/** Also how an allocation is approved: updateAllocation(id, { status: "Approved" }). */
export async function updateAllocation(id, payload) {
  const { data } = await apiClient.patch(`/api/timeoff/allocations/${id}`, payload);
  return data;
}

export async function deleteAllocation(id) {
  await apiClient.delete(`/api/timeoff/allocations/${id}`);
}
