import apiClient from "@/lib/api/client";

/**
 * `employeeId` is only honored for non-EMPLOYEE roles (HR staff checking a
 * colleague in/out) — EMPLOYEE role's own record is always used server-side
 * regardless. The self-service quick-action widget never sends it.
 */
export async function checkIn(employeeId) {
  const { data } = await apiClient.post("/api/attendance/check-in", employeeId ? { employeeId } : {});
  return data;
}

export async function checkOut(employeeId) {
  const { data } = await apiClient.post("/api/attendance/check-out", employeeId ? { employeeId } : {});
  return data;
}

/**
 * Grid request shape per Docs/api/phase-3-attendance.md:
 * { startRow, endRow, sortModel: [{colId, sort}], filterModel: {...} }
 */
export async function listAttendance({ startRow, endRow, sortModel = [], filterModel = {} }) {
  const { data } = await apiClient.post("/api/attendance/list", {
    startRow,
    endRow,
    sortModel,
    filterModel,
  });
  return data; // { rows, rowCount }
}

/**
 * What the quick check-in/check-out widget polls. `employeeId` override is
 * only honored for non-EMPLOYEE roles, same as check-in/check-out.
 */
export async function getCurrentAttendance(employeeId) {
  const { data } = await apiClient.get("/api/attendance/current", {
    params: employeeId ? { employeeId } : undefined,
  });
  return data; // { isOpen, attendance }
}

export async function getAttendance(id) {
  const { data } = await apiClient.get(`/api/attendance/${id}`);
  return data;
}

/** Manual correction — HR Manager+ only, per the API's own role gate. */
export async function updateAttendance(id, payload) {
  const { data } = await apiClient.patch(`/api/attendance/${id}`, payload);
  return data;
}

export async function deleteAttendance(id) {
  await apiClient.delete(`/api/attendance/${id}`);
}
