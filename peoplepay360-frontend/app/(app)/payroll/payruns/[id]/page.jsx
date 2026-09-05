'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '../../../../../src/components/common/StatusBadge.jsx';
import DataTable from '../../../../../src/components/common/DataTable.jsx';
import { PermissionGuard } from '../../../../../src/components/common/Guards.jsx';
import { getPayrunApi, computePayrunApi, validatePayrunApi, markPaidPayrunApi, sendPayslipsApi, getPayslipsApi } from '../../../../../src/api/payrollApi.js';
import { PERMISSIONS } from '../../../../../src/lib/permissions.js';
import { ArrowLeft, Calculator, CheckCircle, CreditCard, Send, AlertTriangle, Users, DollarSign, FileText } from 'lucide-react';

const formatINR = (v) => v ? `₹${v.toLocaleString('en-IN')}` : '—';

const STATUS_STEP = { Draft: 1, Computed: 2, Validated: 3, Paid: 4 };
const STEPS = [
  { key: 'Draft', icon: FileText, label: 'Draft' },
  { key: 'Computed', icon: Calculator, label: 'Computed' },
  { key: 'Validated', icon: CheckCircle, label: 'Validated' },
  { key: 'Paid', icon: CreditCard, label: 'Paid' },
];

export default function PayrunDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [payrun, setPayrun] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    Promise.all([getPayrunApi(id), getPayslipsApi({ payrunId: id })]).then(([pr, ps]) => {
      setPayrun(pr);
      setPayslips(ps.data);
      setLoading(false);
    });
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const doAction = async (action, label) => {
    setActionLoading(label);
    try {
      let updated;
      if (action === 'compute') updated = await computePayrunApi(id);
      else if (action === 'validate') updated = await validatePayrunApi(id);
      else if (action === 'paid') updated = await markPaidPayrunApi(id);
      else if (action === 'send') { await sendPayslipsApi(id); showToast('Payslips sent to employees!'); setActionLoading(''); return; }
      setPayrun(updated);
      showToast(`Payrun ${updated.status} successfully!`);
    } catch {
      showToast('Action failed. Try again.', 'error');
    } finally {
      setActionLoading('');
    }
  };

  const payslipColumns = [
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800">{v}</p>
        <p className="text-xs text-slate-400">{row.department}</p>
      </div>
    )},
    { key: 'workedDays', label: 'Worked Days', render: (v) => `${v} days` },
    { key: 'grossSalary', label: 'Gross', render: (v) => <span className="text-slate-700 font-medium">{formatINR(v)}</span> },
    { key: 'totalDeductions', label: 'Deductions', render: (v) => <span className="text-red-500">{formatINR(v)}</span> },
    { key: 'netSalary', label: 'Net', render: (v) => <span className="font-bold text-emerald-700">{formatINR(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" showDot /> },
  ];

  if (loading) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-64" />;
  if (!payrun) return <div className="text-center py-20 text-slate-400">Payrun not found.</div>;

  const currentStep = STATUS_STEP[payrun.status] || 1;

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white
          ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
        <ArrowLeft size={16} /> Back to Payruns
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{payrun.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{payrun.periodStart} → {payrun.periodEnd} • {payrun.salaryStructureName}</p>
          </div>
          <StatusBadge status={payrun.status} size="lg" showDot />
        </div>

        {/* Step tracker */}
        <div className="flex items-center mb-2">
          {STEPS.map((step, i) => {
            const done = i + 1 < currentStep;
            const active = i + 1 === currentStep;
            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className={`flex flex-col items-center`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition
                    ${done ? 'bg-indigo-600 border-indigo-600 text-white' : active ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-slate-200 text-slate-300'}`}>
                    <step.icon size={16} />
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded ${done ? 'bg-indigo-600' : 'bg-slate-200'}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          {STEPS.map((s) => <span key={s.key} className="text-center">{s.label}</span>)}
        </div>

        {/* Warnings */}
        {payrun.warnings > 0 && payrun.warningMessages && (
          <div className="mt-4 space-y-2">
            {payrun.warningMessages.filter((w) => w.message !== '0 duplicate payslips detected').map((w, i) => (
              <div key={i} className={`flex items-start gap-2 p-3 rounded-xl border text-sm
                ${w.severity === 'critical' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                {w.message}
              </div>
            ))}
          </div>
        )}

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <Users size={18} className="mx-auto text-indigo-500 mb-1" />
            <p className="text-xs text-slate-500">Employees</p>
            <p className="font-bold text-slate-900 text-lg">{payrun.employeeCount}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <DollarSign size={18} className="mx-auto text-slate-500 mb-1" />
            <p className="text-xs text-slate-500">Gross</p>
            <p className="font-bold text-slate-900">{formatINR(payrun.totalGross)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center">
            <p className="text-xs text-red-500 mb-1 font-medium">Deductions</p>
            <p className="font-bold text-red-700">{formatINR(payrun.totalDeductions)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center">
            <p className="text-xs text-emerald-600 mb-1 font-medium">Net</p>
            <p className="font-bold text-emerald-700 text-lg">{formatINR(payrun.totalNet)}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <PermissionGuard permission={PERMISSIONS.PAYRUN_COMPUTE}>
            {payrun.status === 'Draft' && (
              <button onClick={() => doAction('compute', 'Compute')} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
                {actionLoading === 'Compute' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Calculator size={15} />}
                {actionLoading === 'Compute' ? 'Computing...' : 'Compute Payslips'}
              </button>
            )}
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.PAYRUN_VALIDATE}>
            {payrun.status === 'Computed' && (
              <button onClick={() => doAction('validate', 'Validate')} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
                {actionLoading === 'Validate' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />}
                {actionLoading === 'Validate' ? 'Validating...' : 'Validate Payrun'}
              </button>
            )}
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.PAYRUN_MARK_PAID}>
            {payrun.status === 'Validated' && (
              <button onClick={() => doAction('paid', 'MarkPaid')} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
                {actionLoading === 'MarkPaid' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CreditCard size={15} />}
                {actionLoading === 'MarkPaid' ? 'Processing...' : 'Mark as Paid'}
              </button>
            )}
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.PAYRUN_SEND_PAYSLIPS}>
            {payrun.status === 'Paid' && (
              <button onClick={() => doAction('send', 'Send')} disabled={!!actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-60">
                {actionLoading === 'Send' ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={15} />}
                {actionLoading === 'Send' ? 'Sending...' : 'Send Payslips'}
              </button>
            )}
          </PermissionGuard>
        </div>
      </div>

      {/* Payslips */}
      <div>
        <h2 className="font-semibold text-slate-900 mb-3">
          Payslips <span className="text-slate-400 text-sm font-normal">({payslips.length})</span>
        </h2>
        <DataTable
          columns={payslipColumns}
          data={payslips}
          loading={false}
          emptyMessage={payrun.status === 'Draft' ? 'Compute the payrun to generate payslips.' : 'No payslips found for this payrun.'}
          onRowClick={(row) => router.push(`/payroll/payslips/${row.id}`)}
          total={payslips.length}
        />
      </div>
    </div>
  );
}
