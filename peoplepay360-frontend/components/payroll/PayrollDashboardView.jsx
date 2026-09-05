'use client';

import { useState, useEffect } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useAuthSession } from '@/hooks/useAuthSession';
import { formatCurrency, formatDaysOrHours } from '@/lib/formatters';
import {
  LayoutDashboard,
  Filter,
  RefreshCw,
  RotateCcw,
  IndianRupee,
  FileCheck,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  Clock,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  Clock3,
  XCircle,
} from 'lucide-react';

export default function PayrollDashboardView() {
  const { role } = useAuthSession();
  const {
    filters,
    handleFilterChange,
    resetFilters,
    loading,
    error,
    kpis,
    salaryByDept,
    salaryTrend,
    attendanceOverview,
    timeoffOverview,
    departmentOverview,
    refreshAll,
  } = useDashboard();

  const { fetchStructureOptions } = useSalaryStructures();
  const [structureOptions, setStructureOptions] = useState([]);
  const [structureLoading, setStructureLoading] = useState(false);

  // Load employee type / structure options if user role permits
  useEffect(() => {
    const loadStructures = async () => {
      // HR Manager gets 403 on options per RBAC matrix, so guard it
      if (role === 'EMPLOYEE' || role === 'HR_MANAGER') return;
      try {
        setStructureLoading(true);
        const opts = await fetchStructureOptions();
        setStructureOptions(opts || []);
      } catch (err) {
        console.warn('Failed to load salary structure options for dashboard filter:', err);
      } finally {
        setStructureLoading(false);
      }
    };
    loadStructures();
  }, [role, fetchStructureOptions]);

  // Max department spend for relative bar scaling
  const maxDeptSpend = Math.max(...salaryByDept.map((d) => Number(d.totalNetSalary || 0)), 1);

  // Max trend spend for relative bar scaling
  const maxTrendSpend = Math.max(...salaryTrend.map((t) => Number(t.totalNetSalary || 0)), 1);

  return (
    <div className="space-y-6 select-none">
      {/* Dynamic Dashboard Filter Control Panel */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dashboard Analytics Filters</h2>
              <p className="text-xs text-slate-500">
                Filter realized spend, attendance, time off & department metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Period Start */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.periodStart}
              onChange={(e) => handleFilterChange('periodStart', e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Period End */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.periodEnd}
              onChange={(e) => handleFilterChange('periodEnd', e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Department
            </label>
            <input
              type="text"
              placeholder="e.g. Engineering"
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Employee Type (Salary Structure Proxy) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Structure Type
            </label>
            <select
              value={filters.employeeType}
              onChange={(e) => handleFilterChange('employeeType', e.target.value)}
              disabled={role === 'HR_MANAGER' || structureLoading}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none disabled:opacity-50"
            >
              <option value="">All Structures</option>
              {structureOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name || opt.code}
                </option>
              ))}
            </select>
          </div>

          {/* Company */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              type="text"
              placeholder="e.g. MyCompany"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Salary Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Realized Net Spend
            </span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(kpis?.totalNetSalary || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Realized net payout across filtered scope
            </p>
          </div>
        </div>

        {/* Total Payslips Count Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Payslips
            </span>
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis?.payslipCount || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Generated payslip records
            </p>
          </div>
        </div>

        {/* Payslips Status Breakdown Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Payslip Workflow State
            </span>
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Clock3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            {kpis?.byStatus && kpis.byStatus.length > 0 ? (
              kpis.byStatus.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-600 font-semibold">{item.status}:</span>
                  <span className="font-bold text-slate-900">
                    {item.count} ({formatCurrency(item.netSalary)})
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium">No payslips in scope</p>
            )}
          </div>
        </div>

        {/* Data Quality Gaps / Missing Checkouts Alert Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Data Quality Gaps
            </span>
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
                (attendanceOverview?.missingCheckouts || 0) > 0
                  ? 'bg-rose-50 border border-rose-100 text-rose-600'
                  : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3
              className={`text-2xl font-black tracking-tight ${
                (attendanceOverview?.missingCheckouts || 0) > 0 ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {attendanceOverview?.missingCheckouts || 0}
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Missing Checkouts needing HR review
            </p>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Salary Spend by Department */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Realized Payroll Spend by Department</h3>
                <p className="text-xs text-slate-500">Actual computed net payout by org department</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {salaryByDept.length > 0 ? (
              salaryByDept.map((dept, idx) => {
                const percent = Math.round((Number(dept.totalNetSalary || 0) / maxDeptSpend) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{dept.department || 'Unassigned'}</span>
                      <span className="font-bold text-indigo-600">
                        {formatCurrency(dept.totalNetSalary)}{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          ({dept.payslipCount} payslips)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No computed departmental payroll spend found
              </div>
            )}
          </div>
        </div>

        {/* Salary Monthly Spend Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Realized Spend Monthly Trend</h3>
                <p className="text-xs text-slate-500">Historical payrun net trajectory by month</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {salaryTrend.length > 0 ? (
              salaryTrend.map((trend, idx) => {
                const percent = Math.round((Number(trend.totalNetSalary || 0) / maxTrendSpend) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{trend.month}</span>
                      <span className="font-bold text-violet-600">
                        {formatCurrency(trend.totalNetSalary)}{' '}
                        <span className="text-[11px] font-normal text-slate-400">
                          ({trend.payslipCount} payslips)
                        </span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-violet-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No monthly payroll trend data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Analytics Grid: Department Headcount & Leave / Attendance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview (Headcount & Avg Wage) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Department Headcount & Contract Wage</h3>
              <p className="text-xs text-slate-500">Active staff and average base wage</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {departmentOverview.length > 0 ? (
              departmentOverview.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{item.department || 'Unassigned'}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.headcount} {item.headcount === 1 ? 'Employee' : 'Employees'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">
                      {formatCurrency(item.avgWage)}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Wage</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No departmental headcount records
              </div>
            )}
          </div>
        </div>

        {/* Attendance Overview Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Overview</h3>
              <p className="text-xs text-slate-500">Check-in session states & overtime</p>
            </div>
          </div>

          <div className="space-y-3">
            {attendanceOverview?.byStatus && attendanceOverview.byStatus.length > 0 ? (
              attendanceOverview.byStatus.map((statusItem, idx) => (
                <div key={idx} className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {statusItem.status}
                    </span>
                    <span>{statusItem.count} sessions</span>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-slate-600 flex items-center justify-between">
                    <span>Overtime Hours:</span>
                    <span className="font-bold text-emerald-700">
                      {(statusItem.overtimeHours || 0).toFixed(1)} hrs
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 font-medium">
                No attendance sessions in scope
              </div>
            )}

            <div
              className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                (attendanceOverview?.missingCheckouts || 0) > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}
            >
              <span className="font-semibold">Missing Checkouts:</span>
              <span className="font-bold">{attendanceOverview?.missingCheckouts || 0}</span>
            </div>
          </div>
        </div>

        {/* Time Off Overview & Allocations */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Time Off & Leave Balances</h3>
              <p className="text-xs text-slate-500">Request statuses and remaining allocations</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Request Status Breakdown */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Leave Request Statuses
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {timeoffOverview?.requestsByStatus && timeoffOverview.requestsByStatus.length > 0 ? (
                  timeoffOverview.requestsByStatus.map((req, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase">
                        {req.status}
                      </span>
                      <span className="text-sm font-black text-slate-900 block mt-0.5">
                        {req.count}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{req.days} days</span>
                    </div>
                  ))
                ) : (
                  <p className="col-span-3 text-xs text-slate-400 py-2">No requests in period</p>
                )}
              </div>
            </div>

            {/* Remaining Allocations by Type */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Leave Balances
              </p>
              <div className="space-y-2">
                {timeoffOverview?.remainingByType && timeoffOverview.remainingByType.length > 0 ? (
                  timeoffOverview.remainingByType.map((alloc, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">{alloc.type}</span>
                      <div className="text-right">
                        <span className="font-bold text-indigo-600">
                          {alloc.remaining} remaining
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {alloc.taken} taken / {alloc.allocated} total
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 py-2">No leave allocations</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
