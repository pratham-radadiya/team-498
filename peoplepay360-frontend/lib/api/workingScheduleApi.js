import apiClient from "@/lib/api/client";

/**
 * Grid request shape per Docs/api/phase-2-working-schedule-contract.md:
 * { startRow, endRow, sortModel: [{colId, sort}], filterModel: {...} }
 */
export async function listWorkingSchedules({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/working-schedules/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

export async function getWorkingSchedule(id) {
  const { data } = await apiClient.get(`/api/working-schedules/${id}`);
  return data;
}

export async function createWorkingSchedule(payload) {
  const { data } = await apiClient.post("/api/working-schedules", payload);
  return data;
}

export async function updateWorkingSchedule(id, payload) {
  const { data } = await apiClient.patch(`/api/working-schedules/${id}`, payload);
  return data;
}

export async function deleteWorkingSchedule(id) {
  await apiClient.delete(`/api/working-schedules/${id}`);
}
