/**
 * Payroll API — connects to mock service
 */
import { mockPayruns, mockPayslips, mockSalaryStructures, mockSalaryRules, getPayrunById, getPayslipById, getRulesByStructure } from '../mock/payroll.js';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// Payruns
export async function getPayrunsApi() {
  await delay(400);
  return { data: mockPayruns, total: mockPayruns.length };
}
export async function getPayrunApi(id) {
  await delay(300);
  const pr = getPayrunById(id);
  if (!pr) throw new Error('Payrun not found');
  return pr;
}
export async function createPayrunApi(data) {
  await delay(800);
  const newPR = { id: `PAY${Date.now()}`, status: 'Draft', totalGross: 0, totalDeductions: 0, totalNet: 0, payslipCount: data.employeeIds?.length || 0, warnings: 0, createdDate: new Date().toISOString().split('T')[0], ...data };
  mockPayruns.unshift(newPR);
  return newPR;
}
export async function computePayrunApi(id) {
  await delay(1500);
  const pr = mockPayruns.find((p) => p.id === id);
  if (pr) { pr.status = 'Computed'; pr.totalGross = 5820000; pr.totalDeductions = 720000; pr.totalNet = 5100000; }
  return pr;
}
export async function validatePayrunApi(id) {
  await delay(800);
  const pr = mockPayruns.find((p) => p.id === id);
  if (pr) pr.status = 'Validated';
  return pr;
}
export async function markPaidPayrunApi(id) {
  await delay(600);
  const pr = mockPayruns.find((p) => p.id === id);
  if (pr) pr.status = 'Paid';
  return pr;
}
export async function sendPayslipsApi(id) {
  await delay(1000);
  return { success: true, sent: 48 };
}

// Payslips
export async function getPayslipsApi({ payrunId, employeeId } = {}) {
  await delay(400);
  let results = [...mockPayslips];
  if (payrunId) results = results.filter((p) => p.payrunId === payrunId);
  if (employeeId) results = results.filter((p) => p.employeeId === employeeId);
  return { data: results, total: results.length };
}
export async function getPayslipApi(id) {
  await delay(300);
  const ps = getPayslipById(id);
  if (!ps) throw new Error('Payslip not found');
  return ps;
}

// Salary Structures
export async function getSalaryStructuresApi() {
  await delay(400);
  return { data: mockSalaryStructures, total: mockSalaryStructures.length };
}
export async function getSalaryStructureApi(id) {
  await delay(300);
  const s = mockSalaryStructures.find((s) => s.id === id);
  if (!s) throw new Error('Structure not found');
  return { ...s, rules: getRulesByStructure(id) };
}
export async function createSalaryStructureApi(data) {
  await delay(600);
  const newS = { id: `STR${Date.now()}`, rulesCount: 0, employeeCount: 0, ...data };
  mockSalaryStructures.push(newS);
  return newS;
}
export async function updateSalaryStructureApi(id, data) {
  await delay(400);
  const idx = mockSalaryStructures.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error('Not found');
  mockSalaryStructures[idx] = { ...mockSalaryStructures[idx], ...data };
  return mockSalaryStructures[idx];
}
export async function deleteSalaryStructureApi(id) {
  await delay(400);
  return { success: true };
}

// Salary Rules
export async function getSalaryRulesApi({ structureId } = {}) {
  await delay(400);
  let results = [...mockSalaryRules];
  if (structureId) results = results.filter((r) => r.structureId === structureId);
  return { data: results.sort((a, b) => a.sequence - b.sequence), total: results.length };
}
export async function getSalaryRuleApi(id) {
  await delay(300);
  const r = mockSalaryRules.find((r) => r.id === id);
  if (!r) throw new Error('Rule not found');
  return r;
}
export async function createSalaryRuleApi(data) {
  await delay(600);
  const newR = { id: `RULE${Date.now()}`, ...data };
  mockSalaryRules.push(newR);
  return newR;
}
export async function updateSalaryRuleApi(id, data) {
  await delay(400);
  const idx = mockSalaryRules.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error('Not found');
  mockSalaryRules[idx] = { ...mockSalaryRules[idx], ...data };
  return mockSalaryRules[idx];
}

export const payrollApi = {
  getPayruns: getPayrunsApi,
  getPayrunById: getPayrunApi,
  createPayrun: createPayrunApi,
  computePayrun: computePayrunApi,
  validatePayrun: validatePayrunApi,
  markPaidPayrun: markPaidPayrunApi,
  sendPayslips: sendPayslipsApi,
  getPayslips: getPayslipsApi,
  getPayslipById: getPayslipApi,
  getStructures: getSalaryStructuresApi,
  getStructureById: getSalaryStructureApi,
  createStructure: createSalaryStructureApi,
  updateStructure: updateSalaryStructureApi,
  deleteStructure: deleteSalaryStructureApi,
  getRules: getSalaryRulesApi,
  getRuleById: getSalaryRuleApi,
  createRule: createSalaryRuleApi,
  updateRule: updateSalaryRuleApi,
};
