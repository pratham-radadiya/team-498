'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../../../src/components/common/StatusBadge.jsx';
import { getPayslipApi } from '../../../../../src/api/payrollApi.js';
import { ArrowLeft, Download, User, FileText, DollarSign, Printer } from 'lucide-react';

const formatINR = (v) => `₹${v?.toLocaleString('en-IN') || 0}`;

const CATEGORY_STYLES = {
  Basic: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  Allowance: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  Gross: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', bold: true },
  Deduction: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' },
  Net: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600', bold: true },
};

export default function PayslipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayslipApi(id).then((ps) => { setPayslip(ps); setLoading(false); });
  }, [id]);

  if (loading) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-80" />;
  if (!payslip) return <div className="text-center py-20 text-slate-400">Payslip not found.</div>;

  const basicAndAllowances = payslip.lines.filter((l) => ['Basic', 'Allowance'].includes(l.category));
  const deductions = payslip.lines.filter((l) => l.category === 'Deduction');
  const gross = payslip.lines.find((l) => l.category === 'Gross');
  const net = payslip.lines.find((l) => l.category === 'Net');

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 transition">
            <Printer size={14} /> Print
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>

      {/* Payslip document */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm print:shadow-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">PeoplePay360</h1>
              <p className="text-indigo-200 text-xs mt-0.5">HR & Payroll Platform</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">PAYSLIP</p>
              <p className="text-indigo-200 text-xs">{payslip.id}</p>
              <StatusBadge status={payslip.status} size="xs" />
            </div>
          </div>
        </div>

        {/* Employee & Period info */}
        <div className="p-6 grid grid-cols-2 gap-6 border-b border-slate-200">
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Employee</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                {payslip.employeeName?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{payslip.employeeName}</p>
                <p className="text-xs text-slate-400">{payslip.department}</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pay Period</h3>
            <p className="text-sm text-slate-700">{payslip.periodStart} to {payslip.periodEnd}</p>
            <p className="text-xs text-slate-500">{payslip.payrunName}</p>
            <p className="text-xs text-slate-500">Structure: {payslip.salaryStructureName}</p>
            <p className="text-xs text-slate-500">Worked Days: <span className="font-semibold text-slate-700">{payslip.workedDays}</span></p>
          </div>
        </div>

        {/* Salary lines */}
        <div className="p-6 space-y-4">
          {/* Earnings */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-600" /> Earnings
            </h3>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              {basicAndAllowances.map((line, i) => {
                const style = CATEGORY_STYLES[line.category] || {};
                return (
                  <div key={line.code} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                    <div>
                      <span className="text-sm text-slate-700">{line.name}</span>
                      <span className="text-xs text-slate-400 ml-2">({line.code})</span>
                    </div>
                    <span className="text-sm font-medium text-slate-800">{formatINR(line.amount)}</span>
                  </div>
                );
              })}
              {gross && (
                <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-800">Gross Salary</span>
                  <span className="text-sm font-bold text-slate-900">{formatINR(gross.amount)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <span className="text-red-500">−</span> Deductions
            </h3>
            <div className="rounded-xl overflow-hidden border border-red-100">
              {deductions.map((line, i) => (
                <div key={line.code} className={`flex items-center justify-between px-4 py-2.5 ${i % 2 === 0 ? 'bg-white' : 'bg-red-50/40'}`}>
                  <div>
                    <span className="text-sm text-slate-700">{line.name}</span>
                    <span className="text-xs text-slate-400 ml-2">({line.code})</span>
                  </div>
                  <span className="text-sm font-medium text-red-600">- {formatINR(line.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Net */}
          {net && (
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-5 flex items-center justify-between text-white">
              <div>
                <p className="text-indigo-200 text-sm">Net Salary</p>
                <p className="text-3xl font-bold mt-1">{formatINR(net.amount)}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-indigo-200">Gross: {formatINR(payslip.grossSalary)}</p>
                <p className="text-indigo-200 mt-1">Deductions: {formatINR(payslip.totalDeductions)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
          <span>Generated by PeoplePay360 HR & Payroll System</span>
          <span>{payslip.periodStart} — {payslip.periodEnd}</span>
        </div>
      </div>
    </div>
  );
}
