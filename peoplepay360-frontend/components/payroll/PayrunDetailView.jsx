'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { usePayruns } from '@/hooks/usePayruns';
import { canPerformAction } from '@/lib/rbac';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Lock,
  Send,
  Trash2,
  Calendar,
  AlertTriangle,
  User,
  Eye,
  Loader2,
  DollarSign,
  FileText,
  Users
} from 'lucide-react';

export default function PayrunDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchPayrunById,
    computePayrun,
    validatePayrun,
    markPaid,
    sendPayslips,
    deletePayrun,
  } = usePayruns();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [payrunData, setPayrunData] = useState(null);

  const canEdit = canPerformAction(currentUserRole, 'payruns', 'edit');
  const canDelete = canPerformAction(currentUserRole, 'payruns', 'delete');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchPayrunById(id);
      setPayrunData(data);
    } catch (err) {
      setError(err.message || 'Failed to load payrun details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchPayrunById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isPaid = payrunData?.status === 'Paid';
  const isValidated = payrunData?.status === 'Validated';
  const isDraft = payrunData?.status === 'Draft' || !payrunData?.status;

  const handleCompute = async () => {
    setError('');
    setSuccessMsg('');
    setSubmittingAction('compute');
    try {
      const updated = await computePayrun(id);
      setPayrunData(updated);
      setSuccessMsg('Payrun computation completed successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to compute payrun.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleValidate = async () => {
    setError('');
    setSuccessMsg('');
    setSubmittingAction('validate');
    try {
      const updated = await validatePayrun(id);
      setPayrunData(updated);
      setSuccessMsg('Payrun validated and locked.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to validate payrun.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleMarkPaid = async () => {
    setError('');
    setSuccessMsg('');
    setSubmittingAction('mark_paid');
    try {
      const updated = await markPaid(id);
      setPayrunData(updated);
      setSuccessMsg('Payrun marked as Paid.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update payment status.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleSendPayslips = async () => {
    setError('');
    setSuccessMsg('');
    setSubmittingAction('send');
    try {
      const res = await sendPayslips(id);
      setSuccessMsg(`Dispatched payslip notifications (${res?.sentCount ?? 0} sent).`);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send payslips.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this entire payrun batch?')) return;
    setError('');
    setSubmittingAction('delete');
    try {
      await deletePayrun(id);
      router.push('/payroll/payruns');
    } catch (err) {
      setError(err.message || 'Failed to delete payrun.');
      setSubmittingAction('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex relative overflow-x-hidden font-sans antialiased">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onMobileToggle={() => setMobileSidebarOpen(true)} />

        <main className="flex-1 pt-20 px-4 sm:px-6 pb-8 space-y-4 overflow-y-auto custom-scrollbar">
          <DetailPageHeader
            breadcrumbs={[
              { label: 'Payroll', href: '/payroll' },
              { label: 'Payruns', href: '/payroll/payruns' },
              { label: payrunData?.name || `Payrun #${id.slice(0, 8).toUpperCase()}` }
            ]}
            title={payrunData?.name || 'Payrun Processing Batch'}
            subtitle={payrunData ? `Period: ${formatDate(payrunData.startDate)} - ${formatDate(payrunData.endDate)}` : ''}
            icon={<CreditCard className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(payrunData?.status)}`}>
                {payrunData?.status || 'Draft'}
              </span>
            }
            backHref="/payroll/payruns"
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                {canDelete && isDraft && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={Boolean(submittingAction)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                )}

                {canEdit && isDraft && (
                  <button
                    type="button"
                    onClick={handleCompute}
                    disabled={Boolean(submittingAction)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction === 'compute' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Cpu className="w-4 h-4 text-indigo-600" />
                    )}
                    <span>Recompute Sheet</span>
                  </button>
                )}

                {canEdit && isDraft && (
                  <button
                    type="button"
                    onClick={handleValidate}
                    disabled={Boolean(submittingAction)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction === 'validate' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lock className="w-4 h-4" />
                    )}
                    <span>Validate & Lock</span>
                  </button>
                )}

                {canEdit && isValidated && (
                  <button
                    type="button"
                    onClick={handleMarkPaid}
                    disabled={Boolean(submittingAction)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction === 'mark_paid' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>Mark as Paid</span>
                  </button>
                )}

                {canEdit && (isValidated || isPaid) && (
                  <button
                    type="button"
                    onClick={handleSendPayslips}
                    disabled={Boolean(submittingAction)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submittingAction === 'send' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Payslips</span>
                  </button>
                )}
              </div>
            }
          />

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-sm">Loading payrun details...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Financial Totals Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Gross Pay</div>
                  <div className="text-xl font-black text-slate-900 mt-1 font-mono">
                    {formatCurrency(payrunData?.totalGross || 0)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Deductions</div>
                  <div className="text-xl font-black text-rose-600 mt-1 font-mono">
                    {formatCurrency(payrunData?.totalDeductions || 0)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Net Pay</div>
                  <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
                    {formatCurrency(payrunData?.totalNet || 0)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee Payslips</div>
                  <div className="text-xl font-black text-indigo-600 mt-1 font-mono">
                    {payrunData?.payslips?.length || 0}
                  </div>
                </div>
              </div>

              {/* Payslips Batch Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    Generated Payslips ({payrunData?.payslips?.length || 0})
                  </h3>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Employee</th>
                        <th className="px-4 py-3">Contract Ref</th>
                        <th className="px-4 py-3">Gross Pay</th>
                        <th className="px-4 py-3">Deductions</th>
                        <th className="px-4 py-3">Net Pay</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(payrunData?.payslips || []).length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                            No payslips generated for this payrun yet. Click "Recompute Sheet" to generate.
                          </td>
                        </tr>
                      ) : (
                        (payrunData?.payslips || []).map((slip) => (
                          <tr key={slip.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <span>{slip.employee?.name || slip.employeeName || 'Staff Member'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-slate-600">
                              {slip.contract?.contractReference || slip.contractReference || (slip.contractId ? `CON-${slip.contractId.slice(0, 6).toUpperCase()}` : '—')}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-slate-900">
                              {formatCurrency(slip.grossPay ?? slip.gross ?? 0)}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-rose-600">
                              {formatCurrency(slip.totalDeductions ?? Math.max(0, (slip.grossPay ?? slip.gross ?? 0) - (slip.netPay ?? slip.net ?? 0)))}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                              {formatCurrency(slip.netPay ?? slip.net ?? 0)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeClass(slip.status)}`}>
                                {slip.status || 'Draft'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/payroll/payslips/${slip.id}`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
