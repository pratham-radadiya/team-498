'use client';

import { useState, useEffect } from 'react';
import { reportApi } from '../../../src/api/reportApi.js';
import KPICard from '../../../src/components/common/KPICard.jsx';
import ChartCard from '../../../src/components/common/ChartCard.jsx';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import {
  BarChart3, DollarSign, Users, Clock, Umbrella,
  Download, Calendar, TrendingUp, Filter, FileSpreadsheet
} from 'lucide-react';

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('payroll');
  const [dateRange, setDateRange] = useState('Last 6 Months');
  const [payrollData, setPayrollData] = useState(null);
  const [workforceData, setWorkforceData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportApi.getPayrollSummaryReport(),
      reportApi.getWorkforceAnalytics(),
      reportApi.getAttendanceReport(),
    ]).then(([pRes, wRes, aRes]) => {
      setPayrollData(pRes.data);
      setWorkforceData(wRes.data);
      setAttendanceData(aRes.data);
      setLoading(false);
    });
  }, []);

  const handleExportCSV = (reportName) => {
    const csvContent = "data:text/csv;charset=utf-8,Metric,Value\nReport," + reportName + "\nExported At," + new Date().toISOString() + "\nTotal Cost,$512000\nEmployees,31\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise analytics, payroll expense trends, workforce demographics, and compliance reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option>Current Month (Sep 2026)</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>Year to Date (2026)</option>
          </select>
          <button
            onClick={() => handleExportCSV(`${activeTab}_report`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'payroll', label: 'Payroll & Costs', icon: DollarSign },
          { id: 'workforce', label: 'Workforce & Headcount', icon: Users },
          { id: 'attendance', label: 'Attendance & Punctuality', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PAYROLL REPORT TAB */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Payroll Disbursed"
              value={`$${payrollData?.totalPayrollPaid ? payrollData.totalPayrollPaid.toLocaleString() : '512,000'}`}
              subtitle="Current fiscal year"
              icon={DollarSign}
              color="emerald"
            />
            <KPICard
              title="Statutory Deductions"
              value={`$${payrollData?.totalDeductions ? payrollData.totalDeductions.toLocaleString() : '71,000'}`}
              subtitle="Tax, PF & Insurance"
              icon={TrendingUp}
              color="amber"
            />
            <KPICard
              title="Net Disbursed"
              value={`$${payrollData?.totalNetPay ? payrollData.totalNetPay.toLocaleString() : '441,000'}`}
              subtitle="Direct to employees"
              icon={DollarSign}
              color="indigo"
            />
            <KPICard
              title="Average Monthly Wage"
              value={`$${payrollData?.avgSalary ? payrollData.avgSalary.toLocaleString() : '16,516'}`}
              subtitle="Per employee"
              icon={BarChart3}
              color="sky"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Monthly Payroll Expenditure Breakdown" subtitle="Gross vs Deductions vs Net payout (USD)">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={payrollData?.monthlyTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                      <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="gross" name="Gross Pay" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="net" name="Net Disbursed" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="deductions" name="Deductions" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>

            <div>
              <ChartCard title="Expenditure by Department" subtitle="Monthly cost share">
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={payrollData?.departmentPayroll || []}
                        dataKey="amount"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.percentage}%`}
                      >
                        {(payrollData?.departmentPayroll || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            </div>
          </div>
        </div>
      )}

      {/* WORKFORCE REPORT TAB */}
      {activeTab === 'workforce' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Headcount"
              value={workforceData?.totalEmployees || 31}
              subtitle="Across 4 departments"
              icon={Users}
              color="indigo"
            />
            <KPICard
              title="Active Staff"
              value={workforceData?.activeEmployees || 30}
              subtitle="Full-time & contract"
              icon={Users}
              color="emerald"
            />
            <KPICard
              title="Staff Retention Rate"
              value={workforceData?.retentionRate || '94.2%'}
              subtitle="Last 12 months"
              icon={TrendingUp}
              color="sky"
            />
            <KPICard
              title="Avg. Tenure"
              value={`${workforceData?.averageTenureMonths || 22} mos`}
              subtitle="Company average"
              icon={Clock}
              color="amber"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Tenure Distribution" subtitle="Employee count by service length">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={workforceData?.tenureDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" stroke="#64748B" fontSize={12} />
                    <YAxis stroke="#64748B" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" name="Employees" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 text-sm mb-3">Department Headcount & Allocation</h2>
              <div className="divide-y divide-slate-100 text-sm">
                {(workforceData?.departments || []).map((dept) => (
                  <div key={dept.name} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-slate-800">{dept.name}</div>
                      <div className="text-xs text-slate-400">{dept.count} Members</div>
                    </div>
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                      {dept.budget} / mo
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE REPORT TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="On-Time Arrival Rate"
              value={attendanceData?.onTimeRate || '92.4%'}
              subtitle="Punctuality index"
              icon={Clock}
              color="emerald"
            />
            <KPICard
              title="Average Daily Hours"
              value={attendanceData?.averageWorkHours || '8.1h'}
              subtitle="Working time"
              icon={Clock}
              color="indigo"
            />
            <KPICard
              title="Late Arrivals"
              value={attendanceData?.lateArrivals || 24}
              subtitle="Recorded this month"
              icon={Clock}
              color="amber"
            />
            <KPICard
              title="Total Logged Shifts"
              value={attendanceData?.totalPresentDays || 580}
              subtitle="Validated punches"
              icon={Users}
              color="sky"
            />
          </div>

          <ChartCard title="Daily Attendance & Absence Trends" subtitle="September 2026 week-over-week punch records">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData?.dailyAttendance || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="present" name="Present On Time" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="late" name="Late Punch" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="onLeave" name="On Approved Leave" stroke="#6366F1" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}
    </div>
  );
}
