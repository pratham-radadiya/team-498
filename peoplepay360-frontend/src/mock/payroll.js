/**
 * Mock Data — Salary Structures & Rules, Payruns, Payslips
 */

// ─── Salary Structures ──────────────────────────────────────────────────────

export const mockSalaryStructures = [
  {
    id: 'STR001',
    name: 'Regular Salary',
    active: true,
    employeeCount: 42,
    rulesCount: 11,
    description: 'Standard salary structure for full-time employees.',
  },
  {
    id: 'STR002',
    name: 'Intern Salary',
    active: true,
    employeeCount: 6,
    rulesCount: 6,
    description: 'Simplified structure for interns and part-timers.',
  },
  {
    id: 'STR003',
    name: 'Contractor',
    active: true,
    employeeCount: 9,
    rulesCount: 6,
    description: 'Structure for external contractors.',
  },
];

// ─── Salary Rules ────────────────────────────────────────────────────────────

export const mockSalaryRules = [
  // Regular Salary Rules (STR001)
  { id: 'RULE001', structureId: 'STR001', structureName: 'Regular Salary', name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage of Wage', value: '70% of Contract Wage', formula: null },
  { id: 'RULE002', structureId: 'STR001', structureName: 'Regular Salary', name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', sequence: 10, computationMethod: 'Percentage', value: '50% of Basic', formula: null },
  { id: 'RULE003', structureId: 'STR001', structureName: 'Regular Salary', name: 'Standard Allowance', code: 'STD', category: 'Allowance', sequence: 20, computationMethod: 'Fixed Amount', value: '₹2,000', formula: null },
  { id: 'RULE004', structureId: 'STR001', structureName: 'Regular Salary', name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', sequence: 30, computationMethod: 'Percentage', value: '10% of Basic', formula: null },
  { id: 'RULE005', structureId: 'STR001', structureName: 'Regular Salary', name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', sequence: 40, computationMethod: 'Fixed Amount', value: '₹3,000', formula: null },
  { id: 'RULE006', structureId: 'STR001', structureName: 'Regular Salary', name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', sequence: 50, computationMethod: 'Fixed Amount', value: '₹1,500', formula: null },
  { id: 'RULE007', structureId: 'STR001', structureName: 'Regular Salary', name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 60, computationMethod: 'Formula', value: null, formula: "result = categories['BASIC'] + categories['ALLOWANCE']" },
  { id: 'RULE008', structureId: 'STR001', structureName: 'Regular Salary', name: 'LWF Fund', code: 'LWF', category: 'Deduction', sequence: 70, computationMethod: 'Fixed Amount', value: '₹25', formula: null },
  { id: 'RULE009', structureId: 'STR001', structureName: 'Regular Salary', name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 80, computationMethod: 'Percentage', value: '12% of Basic', formula: null },
  { id: 'RULE010', structureId: 'STR001', structureName: 'Regular Salary', name: 'ESIC', code: 'ESIC', category: 'Deduction', sequence: 90, computationMethod: 'Percentage', value: '0.75% of Gross', formula: null },
  { id: 'RULE011', structureId: 'STR001', structureName: 'Regular Salary', name: 'Professional Tax', code: 'PT', category: 'Deduction', sequence: 100, computationMethod: 'Fixed Amount', value: '₹200', formula: null },
  { id: 'RULE012', structureId: 'STR001', structureName: 'Regular Salary', name: 'Net Salary', code: 'NET', category: 'Net', sequence: 110, computationMethod: 'Formula', value: null, formula: "result = categories['GROSS'] - categories['DEDUCTION']" },
  // Intern Salary Rules (STR002)
  { id: 'RULE101', structureId: 'STR002', structureName: 'Intern Salary', name: 'Basic Stipend', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Fixed Amount', value: '₹15,000', formula: null },
  { id: 'RULE102', structureId: 'STR002', structureName: 'Intern Salary', name: 'Transport Allowance', code: 'TRANS', category: 'Allowance', sequence: 10, computationMethod: 'Fixed Amount', value: '₹2,000', formula: null },
  { id: 'RULE103', structureId: 'STR002', structureName: 'Intern Salary', name: 'Meal Allowance', code: 'MEAL', category: 'Allowance', sequence: 20, computationMethod: 'Fixed Amount', value: '₹1,500', formula: null },
  { id: 'RULE104', structureId: 'STR002', structureName: 'Intern Salary', name: 'Gross', code: 'GROSS', category: 'Gross', sequence: 30, computationMethod: 'Formula', value: null, formula: "result = categories['BASIC'] + categories['ALLOWANCE']" },
  { id: 'RULE105', structureId: 'STR002', structureName: 'Intern Salary', name: 'TDS', code: 'TDS', category: 'Deduction', sequence: 40, computationMethod: 'Fixed Amount', value: '₹0', formula: null },
  { id: 'RULE106', structureId: 'STR002', structureName: 'Intern Salary', name: 'Net Stipend', code: 'NET', category: 'Net', sequence: 50, computationMethod: 'Formula', value: null, formula: "result = categories['GROSS'] - categories['DEDUCTION']" },
];

export const getRulesByStructure = (structureId) =>
  mockSalaryRules.filter((r) => r.structureId === structureId).sort((a, b) => a.sequence - b.sequence);

// ─── Payruns ─────────────────────────────────────────────────────────────────

export const mockPayruns = [
  {
    id: 'PAY001',
    name: 'August 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    status: 'Paid',
    employeeCount: 48,
    totalGross: 5820000,
    totalDeductions: 720000,
    totalNet: 5100000,
    payslipCount: 48,
    warnings: 0,
    createdDate: '2026-09-01',
  },
  {
    id: 'PAY002',
    name: 'July 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-07-01',
    periodEnd: '2026-07-31',
    status: 'Paid',
    employeeCount: 47,
    totalGross: 5710000,
    totalDeductions: 705000,
    totalNet: 5005000,
    payslipCount: 47,
    warnings: 0,
    createdDate: '2026-08-01',
  },
  {
    id: 'PAY003',
    name: 'September 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-09-01',
    periodEnd: '2026-09-30',
    status: 'Draft',
    employeeCount: 50,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    payslipCount: 50,
    warnings: 3,
    createdDate: '2026-09-05',
    warningMessages: [
      { type: 'missing_bank', severity: 'warning', message: '2 employees missing bank account details' },
      { type: 'contract_expiry', severity: 'warning', message: '1 contract expiring this month' },
      { type: 'duplicate', severity: 'critical', message: '0 duplicate payslips detected' },
    ],
  },
];

// ─── Payslips ─────────────────────────────────────────────────────────────────

export const mockPayslips = [
  {
    id: 'PS001',
    employeeId: 'EMP001',
    employeeName: 'Arjun Mehta',
    payrunId: 'PAY001',
    payrunName: 'August 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    status: 'Paid',
    workedDays: 22,
    basicSalary: 84000,
    totalEarnings: 118400,
    totalDeductions: 15545,
    grossSalary: 118400,
    netSalary: 102855,
    department: 'Engineering',
    lines: [
      { name: 'Basic Salary', code: 'BASIC', category: 'Basic', amount: 84000 },
      { name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', amount: 42000 },
      { name: 'Standard Allowance', code: 'STD', category: 'Allowance', amount: 2000 },
      { name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', amount: 8400 },
      { name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', amount: 3000 },
      { name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', amount: 1500 },
      { name: 'Gross Salary', code: 'GROSS', category: 'Gross', amount: 118400 },
      { name: 'LWF Fund', code: 'LWF', category: 'Deduction', amount: 25 },
      { name: 'Provident Fund', code: 'PF', category: 'Deduction', amount: 10080 },
      { name: 'ESIC', code: 'ESIC', category: 'Deduction', amount: 888 },
      { name: 'Professional Tax', code: 'PT', category: 'Deduction', amount: 200 },
      { name: 'Net Salary', code: 'NET', category: 'Net', amount: 102855 },
    ],
  },
  {
    id: 'PS002',
    employeeId: 'EMP002',
    employeeName: 'Sneha Iyer',
    payrunId: 'PAY001',
    payrunName: 'August 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    status: 'Paid',
    workedDays: 21,
    basicSalary: 77000,
    totalEarnings: 108050,
    totalDeductions: 14285,
    grossSalary: 108050,
    netSalary: 93765,
    department: 'Sales',
    lines: [
      { name: 'Basic Salary', code: 'BASIC', category: 'Basic', amount: 77000 },
      { name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', amount: 38500 },
      { name: 'Standard Allowance', code: 'STD', category: 'Allowance', amount: 2000 },
      { name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', amount: 7700 },
      { name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', amount: 3000 },
      { name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', amount: 1500 },
      { name: 'Gross Salary', code: 'GROSS', category: 'Gross', amount: 108050 },
      { name: 'LWF Fund', code: 'LWF', category: 'Deduction', amount: 25 },
      { name: 'Provident Fund', code: 'PF', category: 'Deduction', amount: 9240 },
      { name: 'ESIC', code: 'ESIC', category: 'Deduction', amount: 810 },
      { name: 'Professional Tax', code: 'PT', category: 'Deduction', amount: 200 },
      { name: 'Net Salary', code: 'NET', category: 'Net', amount: 93765 },
    ],
  },
  {
    id: 'PS003',
    employeeId: 'EMP005',
    employeeName: 'Priya Sharma',
    payrunId: 'PAY001',
    payrunName: 'August 2026',
    salaryStructureId: 'STR001',
    salaryStructureName: 'Regular Salary',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-31',
    status: 'Paid',
    workedDays: 22,
    basicSalary: 105000,
    totalEarnings: 146800,
    totalDeductions: 19010,
    grossSalary: 146800,
    netSalary: 127790,
    department: 'Engineering',
    lines: [
      { name: 'Basic Salary', code: 'BASIC', category: 'Basic', amount: 105000 },
      { name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', amount: 52500 },
      { name: 'Standard Allowance', code: 'STD', category: 'Allowance', amount: 2000 },
      { name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', amount: 10500 },
      { name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', amount: 3000 },
      { name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', amount: 1500 },
      { name: 'Gross Salary', code: 'GROSS', category: 'Gross', amount: 146800 },
      { name: 'LWF Fund', code: 'LWF', category: 'Deduction', amount: 25 },
      { name: 'Provident Fund', code: 'PF', category: 'Deduction', amount: 12600 },
      { name: 'ESIC', code: 'ESIC', category: 'Deduction', amount: 1101 },
      { name: 'Professional Tax', code: 'PT', category: 'Deduction', amount: 200 },
      { name: 'Net Salary', code: 'NET', category: 'Net', amount: 127790 },
    ],
  },
];

export const getPayslipById = (id) => mockPayslips.find((p) => p.id === id) || null;
export const getPayslipsByEmployee = (employeeId) => mockPayslips.filter((p) => p.employeeId === employeeId);
export const getPayslipsByPayrun = (payrunId) => mockPayslips.filter((p) => p.payrunId === payrunId);
export const getPayrunById = (id) => mockPayruns.find((p) => p.id === id) || null;
