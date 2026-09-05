'use client';

import Link from 'next/link';
import KPICard from '../common/KPICard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { DollarSign, FileText, Clock, AlertTriangle } from 'lucide-react';
import { mockPayruns } from '../../mock/payroll.js';
import { mockDashboardKPIs, mockPayrollAlerts } from '../../mock/dashboard.js';

const formatINR = (v) => `₹${(v / 100000).toFixed(1)}L`;

const ALERT_STYLES = { warning: 'border-amber-200 bg-amber-50 text-amber-800', info: 'border-blue-200 bg-blue-50 text-blue-800', critical: 'border-red-200 bg-red-50 text-red-800', success: 'border-emerald-200 bg-emerald-50 text-emerald-800' };

export default function HRPayrollUserDashboard() {
  const kpis = mockDashboardKPIs;
  const draftRuns = mockPayruns.filter((p) => p.status === 'Draft');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payroll Operations</h1>
        <p className="text-slate-500 text-sm mt-1">Manage payruns, payslips, and payroll processing</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Net Salary (Aug)" value={formatINR(kpis.totalNetSalaryPaid.value)} icon={DollarSign} color="emerald" change={kpis.totalNetSalaryPaid.change} />
        <KPICard label="Payslips Generated" value={kpis.payslipsGenerated.value} icon={FileText} color="indigo" subValue={`${kpis.payslipsGenerated.paid} paid`} />
        <KPICard label="Pending Payruns" value={draftRuns.length} icon={Clock} color="amber" note="Awaiting processing" />
        <KPICard label="Attendance Health" value={kpis.attendanceHealth.value} suffix="%" icon={AlertTriangle} color="cyan" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Payruns */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Payruns</h2>
            <Link href="/payroll/payruns" className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all</Link>
          </div>
          <div className="space-y-3">
            {mockPayruns.map((pr) => (
              <Link key={pr.id} href={`/payroll/payruns/${pr.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group">
                <div>
                  <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-600">{pr.name}</p>
                  <p className="text-xs text-slate-500">{pr.employeeCount} employees • {pr.periodStart} to {pr.periodEnd}</p>
                </div>
                <div className="flex items-center gap-2">
                  {pr.warnings > 0 && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={12} />{pr.warnings}</span>}
                  <StatusBadge status={pr.status} size="xs" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Payroll Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Payroll Alerts</h2>
          <div className="space-y-2">
            {mockPayrollAlerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded-xl border text-sm ${ALERT_STYLES[alert.type] || ''}`}>
                <p className="font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
