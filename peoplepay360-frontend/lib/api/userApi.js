import apiClient from "@/lib/api/client";

export async function listUsers() {
  const { data } = await apiClient.get("/api/users");
  return data; // [{ id, email, role, status, employeeId, createdAt }]
}

export async function getUser(id) {
  const { data } = await apiClient.get(`/api/users/${id}`);
  return data;
}

export async function createUser(payload) {
  const { data } = await apiClient.post("/api/users", payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await apiClient.patch(`/api/users/${id}`, payload);
  return data;
}
