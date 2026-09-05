'use client';

import Link from 'next/link';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import KPICard from '../common/KPICard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { DollarSign, FileText, Users, Calendar, TrendingUp, AlertTriangle, Shield } from 'lucide-react';
import { mockDashboardKPIs, mockSalaryByDepartment, mockMonthlySalaryTrend, mockPayrollAlerts, mockDepartmentOverview, getAttendanceSummary } from '../../mock/dashboard.js';
import { getAttendanceSummary as getSummary } from '../../mock/attendance.js';
import { getTimeOffSummary } from '../../mock/timeOff.js';

const formatINR = (v) => `₹${(v / 100000).toFixed(1)}L`;
const formatINRFull = (v) => `₹${v.toLocaleString('en-IN')}`;

const ALERT_STYLES = { warning: 'border-amber-200 bg-amber-50 text-amber-800', info: 'border-blue-200 bg-blue-50 text-blue-800', critical: 'border-red-200 bg-red-50 text-red-800', success: 'border-emerald-200 bg-emerald-50 text-emerald-800' };
const ALERT_ICONS = { warning: '⚠️', info: 'ℹ️', critical: '🚨', success: '✅' };

export default function HRPayrollManagerDashboard() {
  const kpis = mockDashboardKPIs;
  const attSummary = getSummary();
  const tofSummary = getTimeOffSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Full HR & Payroll operations overview</p>
        </div>
        {/* Filter bar */}
        <div className="flex items-center gap-2">
          {['Period', 'Department', 'Employee Type'].map((f) => (
            <select key={f} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>{f}: All</option>
            </select>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Total Net Salary Paid" value={formatINRFull(kpis.totalNetSalaryPaid.value)} icon={DollarSign} color="emerald" change={kpis.totalNetSalaryPaid.change} changeLabel="vs last month" />
        <KPICard label="Payslips Generated" value={kpis.payslipsGenerated.value} icon={FileText} color="indigo" subValue={`${kpis.payslipsGenerated.paid} paid • ${kpis.payslipsGenerated.pending} pending`} />
        <KPICard label="Avg Salary / Employee" value={formatINRFull(kpis.averageSalary.value)} icon={Users} color="violet" note={kpis.averageSalary.note} />
        <KPICard label="Approved Time Off Days" value={kpis.approvedTimeOffDays.value} icon={Calendar} color="amber" note={kpis.approvedTimeOffDays.note} />
        <KPICard label="Attendance Health" value={kpis.attendanceHealth.value} suffix="%" icon={TrendingUp} color="cyan" note={kpis.attendanceHealth.note} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary by Department */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Salary Cost by Department</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mockSalaryByDepartment} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="department" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} />
              <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [formatINRFull(v), 'Monthly Salary']} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="totalSalary" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Monthly Net Salary Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={mockMonthlySalaryTrend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} />
              <YAxis tickFormatter={formatINR} tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(v) => [formatINRFull(v)]} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
              <Line type="monotone" dataKey="netSalary" stroke="#4F46E5" strokeWidth={2.5} dot={{ fill: '#4F46E5', r: 4 }} name="Net Salary" />
              <Line type="monotone" dataKey="grossSalary" stroke="#7C3AED" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Gross Salary" />
              <Legend />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payroll Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Payroll Alerts</h2>
          <div className="space-y-2">
            {mockPayrollAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-2 p-3 rounded-xl border text-sm ${ALERT_STYLES[alert.type] || ''}`}>
                <span className="shrink-0 mt-0.5">{ALERT_ICONS[alert.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium leading-tight">{alert.message}</p>
                  {alert.action && <Link href="#" className="text-xs underline mt-1 block opacity-80">{alert.action}</Link>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Attendance Overview</h2>
          <div className="space-y-3">
            {[
              { label: 'Present', value: attSummary.present, color: 'bg-emerald-500' },
              { label: 'Late', value: attSummary.late, color: 'bg-amber-500' },
              { label: 'Absent', value: attSummary.absent, color: 'bg-red-500' },
              { label: 'Overtime', value: attSummary.overtime, color: 'bg-blue-500' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-sm text-slate-600">{item.label}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Coverage</span>
                <span className="font-bold text-indigo-600">{attSummary.coveragePercent}%</span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${attSummary.coveragePercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Time Off Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Time Off Overview</h2>
          <div className="space-y-3">
            {tofSummary.byType.map((t) => (
              <div key={t.type} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700" style={{ color: t.color }}>{t.type}</span>
                  {t.remaining !== null && <span className="text-xs text-slate-500">{t.remaining} remaining</span>}
                </div>
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>✅ {t.approved} approved</span>
                  <span>⏳ {t.pending} pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Department Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Department</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Headcount</th>
                <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockDepartmentOverview.map((dept) => (
                <tr key={dept.department} className="hover:bg-slate-50">
                  <td className="py-3 text-sm font-medium text-slate-700">{dept.department}</td>
                  <td className="py-3 text-sm text-slate-600 text-right">{dept.headcount}</td>
                  <td className="py-3 text-sm font-semibold text-slate-900 text-right">{formatINR(dept.monthlySalary)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Models to Aggregate */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-5">
        <h2 className="font-semibold text-slate-900 mb-2">📊 Models Aggregated in this Dashboard</h2>
        <p className="text-sm text-slate-600 mb-4">This dashboard combines data from multiple HR & Payroll models to present unified insights.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: 'Employees & Departments', icon: '👥', detail: 'Headcount, grouping, ownership' },
            { label: 'Contracts', icon: '📄', detail: 'Wage, schedule, active employees' },
            { label: 'Payruns & Payslips', icon: '💰', detail: 'Totals, paid vs pending, trends' },
            { label: 'Attendance', icon: '⏰', detail: 'Presence, absences, late entries' },
            { label: 'Time Off', icon: '🌴', detail: 'Leave taken and balances' },
          ].map((m) => (
            <div key={m.label} className="bg-white rounded-xl p-3 border border-indigo-100 shadow-sm">
              <div className="text-2xl mb-1">{m.icon}</div>
              <div className="text-sm font-semibold text-slate-800 leading-tight">{m.label}</div>
              <div className="text-xs text-slate-500 mt-1 leading-tight">{m.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
