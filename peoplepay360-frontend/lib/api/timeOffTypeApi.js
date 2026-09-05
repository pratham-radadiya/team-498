import apiClient from "@/lib/api/client";

/**
 * Grid request shape per Docs/api/phase-4-time-off.md:
 * { startRow, endRow, sortModel: [{colId, sort}], filterModel: {...} }
 */
export async function listTimeOffTypes({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/timeoff/types/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

export async function getTimeOffType(id) {
  const { data } = await apiClient.get(`/api/timeoff/types/${id}`);
  return data;
}

export async function createTimeOffType(payload) {
  const { data } = await apiClient.post("/api/timeoff/types", payload);
  return data;
}

export async function updateTimeOffType(id, payload) {
  const { data } = await apiClient.patch(`/api/timeoff/types/${id}`, payload);
  return data;
}

export async function deleteTimeOffType(id) {
  await apiClient.delete(`/api/timeoff/types/${id}`);
}
