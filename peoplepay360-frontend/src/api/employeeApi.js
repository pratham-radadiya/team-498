/**
 * Employee API — connects to mock service or real backend
 */
import { mockEmployees, getEmployeeById, getEmployeeStats } from '../mock/employees.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getEmployeesApi({ search = '', department = '', status = '', page = 1, limit = 20 } = {}) {
  await delay(400);
  let results = [...mockEmployees];
  if (search) results = results.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()));
  if (department) results = results.filter((e) => e.department === department);
  if (status) results = results.filter((e) => e.status === status);
  const total = results.length;
  const start = (page - 1) * limit;
  return { data: results.slice(start, start + limit), total, page, limit };
}

export async function getEmployeeApi(id) {
  await delay(300);
  const emp = getEmployeeById(id);
  if (!emp) throw new Error('Employee not found');
  return emp;
}

export async function getEmployeeStatsApi(id) {
  await delay(200);
  return getEmployeeStats(id);
}

export async function createEmployeeApi(data) {
  await delay(600);
  const newEmp = { ...data, id: `EMP${Date.now()}`, status: data.status || 'Active' };
  mockEmployees.push(newEmp);
  return newEmp;
}

export async function updateEmployeeApi(id, data) {
  await delay(400);
  const idx = mockEmployees.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Employee not found');
  mockEmployees[idx] = { ...mockEmployees[idx], ...data };
  return mockEmployees[idx];
}

export async function deleteEmployeeApi(id) {
  await delay(400);
  const idx = mockEmployees.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error('Employee not found');
  mockEmployees.splice(idx, 1);
  return { success: true };
}

export const employeeApi = {
  getEmployees: getEmployeesApi,
  getEmployeeById: getEmployeeApi,
  getEmployeeStats: getEmployeeStatsApi,
  createEmployee: createEmployeeApi,
  updateEmployee: updateEmployeeApi,
  deleteEmployee: deleteEmployeeApi,
};
