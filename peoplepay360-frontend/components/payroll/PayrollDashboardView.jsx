'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDashboard } from '@/hooks/useDashboard';
import { useSalaryStructures } from '@/hooks/useSalaryStructures';
import { useAuthSession } from '@/hooks/useAuthSession';
import { formatCurrency } from '@/lib/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  Users,
  CreditCard,
  Clock,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Filter,
  CheckCircle2,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Layers,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

export default function PayrollDashboardView() {
  const { role } = useAuthSession();
  const {
    filters,
    setFilters,
    loading,
    error,
    kpis,
    salaryByDept,
    salaryTrend,
    attendanceOverview,
    timeOffOverview,
    deptOverview,
    refreshAll,
    resetFilters,
  } = useDashboard();

  const { fetchStructureOptions } = useSalaryStructures();
  const [employeeTypeOptions, setEmployeeTypeOptions] = useState([]);
  const [canLoadEmployeeTypes, setCanLoadEmployeeTypes] = useState(true);

  // Load employee type options (Salary Structures) on mount if role permits
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const opts = await fetchStructureOptions();
        setEmployeeTypeOptions(opts || []);
      } catch (err) {
        setCanLoadEmployeeTypes(false);
      }
    };

    if (['HR_PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'ADMIN'].includes(role)) {
      loadOptions();
    } else {
      setCanLoadEmployeeTypes(false);
    }
  }, [role, fetchStructureOptions]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Donut Chart Data & Colors
  const pieColors = {
    Draft: '#94a3b8',
    Validated: '#f59e0b',
    Paid: '#10b981',
  };

  const pieData = useMemo(() => {
    return (kpis?.byStatus || []).map((st) => ({
      name: st.status,
      value: st.count || 0,
      netSalary: st.netSalary || 0,
      color: pieColors[st.status] || '#6366f1',
    }));
  }, [kpis]);

  // Total Headcount from Dept Overview
  const totalHeadcount = useMemo(() => {
    return (deptOverview || []).reduce((acc, d) => acc + (d.headcount || 0), 0);
  }, [deptOverview]);

  // Format currency for chart Y-Axis
  const formatYAxisCurrency = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
    return `₹${value}`;
  };

  // Custom Glassmorphic Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label, currency = true }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700/50 text-xs space-y-1 z-50">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">{label || payload[0]?.name}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center gap-2 pt-0.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-slate-400">{entry.name}:</span>
              <span className="font-extrabold text-white">
                {currency && typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 select-none">
      {/* Dynamic Filter Controls Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Executive Dashboard Filters</h2>
              <p className="text-xs text-slate-500">Filter spend, headcount, attendance, and leave across the organization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
            >
              Reset Filters
            </button>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.periodStart}
              onChange={(e) => handleFilterChange('periodStart', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.periodEnd}
              onChange={(e) => handleFilterChange('periodEnd', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
            >
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Administration">Administration</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Employee Type
            </label>
            {canLoadEmployeeTypes ? (
              <select
                value={filters.employeeType}
                onChange={(e) => handleFilterChange('employeeType', e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
              >
                <option value="">All Structures</option>
                {employeeTypeOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                placeholder="N/A for HR Manager"
                className="w-full px-3.5 py-2 text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl text-slate-400 cursor-not-allowed"
              />
            )}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Company
            </label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="Search company..."
              className="w-full px-3.5 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Top Executive KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Realized Net Salary Spend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Realized Net
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Net Salary Spend</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {formatCurrency(kpis?.totalNetSalary || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Across {kpis?.payslipCount || 0} processed payslips
            </p>
          </div>
        </div>

        {/* KPI 2: Total Active Headcount */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              Active Headcount
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Staff Members</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {totalHeadcount} <span className="text-xs font-normal text-slate-500">Employees</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Across {deptOverview.length} departments</p>
          </div>
        </div>

        {/* KPI 3: Payslip Workflow Count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shadow-sm">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
              Payslips
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Generated Payslips</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {kpis?.payslipCount || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(kpis?.byStatus || []).map((s) => `${s.count} ${s.status}`).join(', ') || 'No payslips'}
            </p>
          </div>
        </div>

        {/* KPI 4: Attendance Data Quality Alert */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-sm ${
              (attendanceOverview?.missingCheckouts || 0) > 0
                ? 'bg-amber-50 border-amber-200 text-amber-600'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              {(attendanceOverview?.missingCheckouts || 0) > 0 ? (
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              (attendanceOverview?.missingCheckouts || 0) > 0
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {(attendanceOverview?.missingCheckouts || 0) > 0 ? 'Data Gap Alert' : 'Clean Data'}
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Data Quality</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {attendanceOverview?.missingCheckouts || 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {(attendanceOverview?.missingCheckouts || 0) > 0
                ? 'Open sessions with missing check-outs'
                : 'All session records checked out properly'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid 1: Area & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CHART 1: Monthly Payroll Spend Trajectory (Smooth Spline Area Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Monthly Payroll Spend Trajectory</h3>
                <p className="text-xs text-slate-500">Realized net salary spend trend by payrun month</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {salaryTrend.length} Months
            </span>
          </div>

          <div className="pt-2">
            {salaryTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salaryTrend} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salaryTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatYAxisCurrency} />
                  <Tooltip content={<CustomTooltip currency={true} />} />
                  <Area
                    type="monotone"
                    dataKey="totalNetSalary"
                    name="Net Salary"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#salaryTrendGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                No monthly payroll spend records available for current filters
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: Realized Spend by Department (Vertical Bar Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Realized Spend by Department</h3>
                <p className="text-xs text-slate-500">Actual computed net salary spend comparison</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {salaryByDept.length} Depts
            </span>
          </div>

          <div className="pt-2">
            {salaryByDept.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={salaryByDept} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="department" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatYAxisCurrency} />
                  <Tooltip content={<CustomTooltip currency={true} />} />
                  <Bar dataKey="totalNetSalary" name="Net Salary" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                No departmental spend data for selected filter scope
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Charts Grid 2: Donut Chart & Time Off Balances Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 3: Payslip Workflow Status (Interactive Donut Chart) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Payslip Workflow Status</h3>
                <p className="text-xs text-slate-500">Breakdown of Draft vs Paid payslips</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {pieData.length > 0 ? (
              <div className="relative flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip currency={false} />} />
                  </PieChart>
                </ResponsiveContainer>

                <div className="w-full space-y-2 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs px-2 py-1 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-800">{item.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{item.value} slips ({formatCurrency(item.netSalary)})</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                No payslip workflow data in scope
              </div>
            )}
          </div>
        </div>

        {/* CHART 4: Time Off Allocations & Leave Balances (Horizontal Bar Chart) */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Time Off Leave Allocations</h3>
                <p className="text-xs text-slate-500">Allocated vs remaining leave days by type</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {timeOffOverview?.remainingByType && timeOffOverview.remainingByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  layout="vertical"
                  data={timeOffOverview.remainingByType}
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis type="category" dataKey="type" stroke="#94a3b8" fontSize={11} tickLine={false} width={80} />
                  <Tooltip content={<CustomTooltip currency={false} />} />
                  <Bar dataKey="remaining" name="Remaining Days" fill="#818cf8" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="allocated" name="Total Allocated" fill="#cbd5e1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                No leave allocation records found
              </div>
            )}
          </div>
        </div>

        {/* CHART 5: Attendance & Overtime Hours */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Attendance & Overtime</h3>
                <p className="text-xs text-slate-500">Session logs & overtime tracking</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {(attendanceOverview?.byStatus || []).map((st) => (
              <div key={st.status} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between hover:bg-slate-100/60 transition-all">
                <div>
                  <p className="text-xs font-bold text-slate-900">{st.status} Attendance Sessions</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{st.count} total session records</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-teal-600">
                    {st.overtimeHours ? Number(st.overtimeHours).toFixed(1) : '0'} hrs
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overtime Logged</p>
                </div>
              </div>
            ))}

            {(!attendanceOverview?.byStatus || attendanceOverview.byStatus.length === 0) && (
              <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl">
                No attendance session records in scope
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Department Headcount vs Average Contract Wages Breakdown Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Department Headcount & Contract Wage Analysis</h3>
              <p className="text-xs text-slate-500">Current employee headcount and active running contract average wage per department</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50">
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4">Headcount</th>
                <th className="py-3 px-4">Average Contract Wage</th>
                <th className="py-3 px-4">Wage Bar Scale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deptOverview.map((dept) => {
                const maxWage = Math.max(...deptOverview.map((d) => d.avgWage || 0), 1);
                const pct = Math.round(((dept.avgWage || 0) / maxWage) * 100);

                return (
                  <tr key={dept.department} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{dept.department}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-full font-bold">
                        {dept.headcount} Staff
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-indigo-600">
                      {dept.avgWage ? formatCurrency(dept.avgWage) : '₹0'}
                    </td>
                    <td className="py-3.5 px-4 w-1/3">
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
