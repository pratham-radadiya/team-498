/**
 * Mock Data — Dashboard KPIs, Charts, Overviews
 */

export const mockDashboardKPIs = {
  totalNetSalaryPaid: { value: 51000000, change: 8.5, label: 'Total Net Salary Paid', period: 'August 2026' },
  payslipsGenerated: { value: 148, paid: 142, pending: 6, label: 'Payslips Generated' },
  averageSalary: { value: 102700, label: 'Average Salary / Employee', note: 'Based on current payrun' },
  approvedTimeOffDays: { value: 312, label: 'Approved Time Off Days', note: 'Across selected period' },
  attendanceHealth: { value: 94, label: 'Attendance Health %', note: 'Present/reviewed records' },
};

export const mockSalaryByDepartment = [
  { department: 'Engineering', totalSalary: 4200000, headcount: 18, avgSalary: 233333 },
  { department: 'Sales', totalSalary: 5700000, headcount: 22, avgSalary: 259090 },
  { department: 'HR', totalSalary: 1900000, headcount: 8, avgSalary: 237500 },
  { department: 'Finance', totalSalary: 2100000, headcount: 9, avgSalary: 233333 },
  { department: 'Operations', totalSalary: 3100000, headcount: 14, avgSalary: 221428 },
  { department: 'Marketing', totalSalary: 1800000, headcount: 7, avgSalary: 257142 },
  { department: 'Support', totalSalary: 2400000, headcount: 12, avgSalary: 200000 },
];

export const mockMonthlySalaryTrend = [
  { month: 'Feb 2026', netSalary: 4500000, grossSalary: 5200000 },
  { month: 'Mar 2026', netSalary: 4620000, grossSalary: 5350000 },
  { month: 'Apr 2026', netSalary: 4780000, grossSalary: 5520000 },
  { month: 'May 2026', netSalary: 4850000, grossSalary: 5600000 },
  { month: 'Jun 2026', netSalary: 4900000, grossSalary: 5670000 },
  { month: 'Jul 2026', netSalary: 5005000, grossSalary: 5710000 },
  { month: 'Aug 2026', netSalary: 5100000, grossSalary: 5820000 },
];

export const mockPayrollAlerts = [
  { id: 'ALT001', type: 'warning', message: '2 employees missing bank account details', module: 'Payroll', action: 'View Employees' },
  { id: 'ALT002', type: 'info', message: '4 draft payslips not yet validated', module: 'Payslips', action: 'View Payslips' },
  { id: 'ALT003', type: 'warning', message: '3 contracts expiring this month', module: 'Contracts', action: 'View Contracts' },
  { id: 'ALT004', type: 'success', message: 'August 2026 payroll successfully paid', module: 'Payruns', action: null },
  { id: 'ALT005', type: 'critical', message: '1 duplicate payslip warning in September payrun', module: 'Payruns', action: 'View Payrun' },
];

export const mockDepartmentOverview = [
  { department: 'Engineering', headcount: 18, monthlySalary: 4200000 },
  { department: 'Sales', headcount: 22, monthlySalary: 5700000 },
  { department: 'HR', headcount: 8, monthlySalary: 1900000 },
  { department: 'Finance', headcount: 9, monthlySalary: 2100000 },
  { department: 'Operations', headcount: 14, monthlySalary: 3100000 },
  { department: 'Marketing', headcount: 7, monthlySalary: 1800000 },
  { department: 'Support', headcount: 12, monthlySalary: 2400000 },
];

export const mockHRDashboardStats = {
  totalEmployees: 90,
  activeEmployees: 86,
  onLeave: 4,
  attendanceHealth: 94,
  pendingTimeOffRequests: 5,
  upcomingContractExpirations: 3,
  departmentHeadcount: mockDepartmentOverview,
};
