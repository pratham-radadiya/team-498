import { mockEmployees } from '../mock/employees.js';
import { mockPayruns, mockPayslips } from '../mock/payroll.js';
import { mockAttendance } from '../mock/attendance.js';
import { mockLeaveRequests, mockAllocations } from '../mock/timeOff.js';

export const reportApi = {
  getPayrollSummaryReport: async () => {
    const totalPayrollPaid = mockPayruns
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.totalGross || 0), 0);

    const totalDeductions = mockPayruns
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.totalDeductions || 0), 0);

    const totalNetPay = mockPayruns
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.totalNet || 0), 0);

    const monthlyTrends = [
      { month: 'Apr 2026', gross: 420000, deductions: 58000, net: 362000, employees: 28 },
      { month: 'May 2026', gross: 445000, deductions: 61000, net: 384000, employees: 29 },
      { month: 'Jun 2026', gross: 460000, deductions: 63500, net: 396500, employees: 30 },
      { month: 'Jul 2026', gross: 480000, deductions: 66000, net: 414000, employees: 30 },
      { month: 'Aug 2026', gross: 495000, deductions: 68500, net: 426500, employees: 31 },
      { month: 'Sep 2026', gross: 512000, deductions: 71000, net: 441000, employees: 31 },
    ];

    const departmentPayroll = [
      { department: 'Engineering', amount: 260000, count: 14, percentage: 50.8 },
      { department: 'Product & Design', amount: 115000, count: 6, percentage: 22.5 },
      { department: 'Sales & Marketing', amount: 82000, count: 6, percentage: 16.0 },
      { department: 'HR & Operations', amount: 55000, count: 5, percentage: 10.7 },
    ];

    return Promise.resolve({
      data: {
        totalPayrollPaid,
        totalDeductions,
        totalNetPay,
        avgSalary: Math.round(totalPayrollPaid / 31),
        monthlyTrends,
        departmentPayroll,
      },
    });
  },

  getWorkforceAnalytics: async () => {
    const totalEmployees = mockEmployees.length;
    const activeEmployees = mockEmployees.filter((e) => e.status === 'Active').length;
    const departments = [
      { name: 'Engineering', count: 14, budget: '$260,000' },
      { name: 'Product & Design', count: 6, budget: '$115,000' },
      { name: 'Sales & Marketing', count: 6, budget: '$82,000' },
      { name: 'HR & Operations', count: 5, budget: '$55,000' },
    ];

    const genderDiversity = [
      { name: 'Male', value: 18, percentage: '58%' },
      { name: 'Female', value: 12, percentage: '39%' },
      { name: 'Non-Binary/Other', value: 1, percentage: '3%' },
    ];

    const tenureDistribution = [
      { range: '< 1 Year', count: 8 },
      { range: '1 - 2 Years', count: 12 },
      { range: '2 - 4 Years', count: 7 },
      { range: '4+ Years', count: 4 },
    ];

    return Promise.resolve({
      data: {
        totalEmployees,
        activeEmployees,
        departments,
        genderDiversity,
        tenureDistribution,
        retentionRate: '94.2%',
        averageTenureMonths: 22,
      },
    });
  },

  getAttendanceReport: async () => {
    const onTimeRate = '92.4%';
    const averageWorkHours = '8.1h';
    const totalPresentDays = 580;
    const lateArrivals = 24;

    const dailyAttendance = [
      { date: '2026-09-01', present: 30, late: 1, absent: 0, onLeave: 1 },
      { date: '2026-09-02', present: 29, late: 2, absent: 0, onLeave: 2 },
      { date: '2026-09-03', present: 31, late: 0, absent: 0, onLeave: 0 },
      { date: '2026-09-04', present: 30, late: 1, absent: 0, onLeave: 1 },
      { date: '2026-09-05', present: 30, late: 1, absent: 0, onLeave: 1 },
    ];

    return Promise.resolve({
      data: {
        onTimeRate,
        averageWorkHours,
        totalPresentDays,
        lateArrivals,
        dailyAttendance,
      },
    });
  },
};
