'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { payrollApi } from '../../../../src/api/payrollApi.js';
import KPICard from '../../../../src/components/common/KPICard.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import {
  DollarSign, FileText, CheckCircle2, Clock, Plus,
  ArrowRight, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';

export default function PayrollDashboardPage() {
  const [payruns, setPayruns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      payrollApi.getPayruns(),
      payrollApi.getPayslips(),
    ]).then(([prRes, psRes]) => {
      setPayruns(prRes.data || []);
      setPayslips(psRes.data || []);
      setLoading(false);
    });
  }, []);

  const totalGrossPaid = payruns
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (p.totalGross || 0), 0);

  const pendingPayruns = payruns.filter((p) => p.status === 'Draft' || p.status === 'Computed');

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR_PAYROLL_MANAGER', 'HR_PAYROLL_USER']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll Operations Center</h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitor active payruns, salary disbursements, payslip deliveries, and tax compliance.
            </p>
          </div>
          <Link
            href="/payroll/payruns/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm"
          >
            <Plus size={16} />
            <span>Create New Payrun</span>
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Disbursed (YTD)"
            value={`$${totalGrossPaid.toLocaleString()}`}
            subtitle="Completed payruns"
            icon={DollarSign}
            color="emerald"
          />
          <KPICard
            title="Active Payruns"
            value={payruns.length}
            subtitle={`${pendingPayruns.length} awaiting completion`}
            icon={Clock}
            color="indigo"
          />
          <KPICard
            title="Generated Payslips"
            value={payslips.length}
            subtitle="Current cycle slips"
            icon={FileText}
            color="sky"
          />
          <KPICard
            title="Tax & PF Compliance"
            value="100%"
            subtitle="Statutory rules applied"
            icon={ShieldCheck}
            color="amber"
          />
        </div>

        {/* Quick Links Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: 'Payrun Batches', count: `${payruns.length} Runs`, href: '/payroll/payruns', color: 'border-indigo-100 bg-indigo-50/50' },
            { label: 'Payslip Archive', count: `${payslips.length} Slips`, href: '/payroll/payslips', color: 'border-sky-100 bg-sky-50/50' },
            { label: 'Salary Structures', count: 'Standard & Executive', href: '/payroll/structures', color: 'border-purple-100 bg-purple-50/50' },
            { label: 'Salary Rules', count: '14 Active Equations', href: '/payroll/rules', color: 'border-emerald-100 bg-emerald-50/50' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`p-4 rounded-2xl border ${item.color} hover:shadow-md transition flex items-center justify-between group bg-white`}
            >
              <div>
                <div className="font-semibold text-slate-900 text-sm">{item.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.count}</div>
              </div>
              <ArrowRight size={16} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
            </Link>
          ))}
        </div>

        {/* Recent Payrun Batches */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900 text-base">Recent Payrun Batches</h2>
              <p className="text-xs text-slate-500">Live lifecycle status of payrun calculation and disbursement</p>
            </div>
            <Link href="/payroll/payruns" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All Payruns →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Payrun Batch</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4">Employees</th>
                  <th className="py-3 px-4">Gross Total</th>
                  <th className="py-3 px-4">Net Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payruns.slice(0, 5).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">{p.periodStart} ~ {p.periodEnd}</td>
                    <td className="py-3 px-4 text-xs text-slate-700">{p.employeeCount || 30} Staff</td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">${(p.totalGross || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-600">${(p.totalNet || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/payroll/payruns/${p.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                      >
                        Open Batch
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
