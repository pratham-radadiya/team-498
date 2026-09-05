import apiClient from "@/lib/api/client";

export async function listTimeOffRequests({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/timeoff/requests/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

export async function getTimeOffRequest(id) {
  const { data } = await apiClient.get(`/api/timeoff/requests/${id}`);
  return data;
}

/** `duration` is never sent — the server computes it from startDate/endDate. */
export async function createTimeOffRequest(payload) {
  const { data } = await apiClient.post("/api/timeoff/requests", payload);
  return data;
}

export async function deleteTimeOffRequest(id) {
  await apiClient.delete(`/api/timeoff/requests/${id}`);
}

export async function approveTimeOffRequest(id) {
  const { data } = await apiClient.post(`/api/timeoff/requests/${id}/approve`);
  return data;
}

export async function refuseTimeOffRequest(id) {
  const { data } = await apiClient.post(`/api/timeoff/requests/${id}/refuse`);
  return data;
}
