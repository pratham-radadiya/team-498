'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import {
  X,
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
} from 'lucide-react';

export default function PayrunDetailModal({
  isOpen,
  onClose,
  payrunId,
  fetchPayrunById,
  computePayrun,
  validatePayrun,
  markPaid,
  sendPayslips,
  deletePayrun,
  currentUserRole,
  onSelectPayslip,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [submittingAction, setSubmittingAction] = useState('');
  const [error, setError] = useState('');
  const [sentSummary, setSentSummary] = useState(null);
  const [payrunData, setPayrunData] = useState(null);

  const canEdit = canPerformAction(currentUserRole, 'payruns', 'edit');
  const canDelete = canPerformAction(currentUserRole, 'payruns', 'delete');

  const loadPayrunDetails = async () => {
    if (!payrunId) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchPayrunById(payrunId);
      setPayrunData(data);
    } catch (err) {
      setError(err.message || 'Failed to load payrun details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && payrunId) {
      setSentSummary(null);
      loadPayrunDetails();
    }
  }, [isOpen, payrunId]);

  if (!isOpen) return null;

  const isPaid = payrunData?.status === 'Paid';
  const isValidated = payrunData?.status === 'Validated';
  const isDraft = payrunData?.status === 'Draft' || !payrunData?.status;

  const handleCompute = async () => {
    setError('');
    setSubmittingAction('compute');
    try {
      const updated = await computePayrun(payrunId);
      setPayrunData(updated);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to compute payrun.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleValidate = async () => {
    setError('');
    setSubmittingAction('validate');
    try {
      const updated = await validatePayrun(payrunId);
      setPayrunData(updated);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to validate payrun.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleMarkPaid = async () => {
    setError('');
    setSubmittingAction('markPaid');
    try {
      const updated = await markPaid(payrunId);
      setPayrunData(updated);
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to mark payrun as paid.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleSendPayslips = async () => {
    setError('');
    setSubmittingAction('send');
    try {
      const res = await sendPayslips(payrunId);
      setSentSummary(res);
      loadPayrunDetails();
      onSuccess && onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to send payslips via email.');
    } finally {
      setSubmittingAction('');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this payrun and all associated draft payslips?')) {
      setError('');
      setSubmittingAction('delete');
      try {
        await deletePayrun(payrunId);
        onSuccess && onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete payrun.');
      } finally {
        setSubmittingAction('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{payrunData?.name || 'Payrun Details'}</h2>
                <span className={`badge ${getStatusBadgeClass(payrunData?.status)}`}>
                  {payrunData?.status || 'Draft'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {formatDate(payrunData?.periodStart)} → {formatDate(payrunData?.periodEnd)}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-8 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* 1. Compute Button */}
            {!isPaid && (
              <button
                type="button"
                onClick={handleCompute}
                disabled={Boolean(submittingAction)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {submittingAction === 'compute' ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    <span>Compute Salary Rules</span>
                  </>
                )}
              </button>
            )}

            {/* 2. Validate Button */}
            {isDraft && (
              <button
                type="button"
                onClick={handleValidate}
                disabled={Boolean(submittingAction)}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {submittingAction === 'validate' ? (
                  <span className="w-4 h-4 border-2 border-amber-800/30 border-t-amber-800 rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate Payrun</span>
                  </>
                )}
              </button>
            )}

            {/* 3. Mark Paid Button */}
            {isValidated && (
              <button
                type="button"
                onClick={handleMarkPaid}
                disabled={Boolean(submittingAction)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {submittingAction === 'markPaid' ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Mark as Paid & Lock</span>
                  </>
                )}
              </button>
            )}

            {/* 4. Send Payslips Button */}
            {isPaid && (
              <button
                type="button"
                onClick={handleSendPayslips}
                disabled={Boolean(submittingAction)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {submittingAction === 'send' ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Email PDF Payslips</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Delete Payrun (if not paid and permitted) */}
          {!isPaid && canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={Boolean(submittingAction)}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Payrun</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {sentSummary && (
            <div className="p-4 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-900 text-xs space-y-1">
              <p className="font-bold flex items-center gap-2">
                <Send className="w-4 h-4 text-purple-600" />
                <span>Successfully sent {sentSummary.sent} payslips via email</span>
              </p>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading payrun details...</div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Salary Structure</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">{payrunData?.structure?.name || '—'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Payslip Count</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">
                    {payrunData?.payslips ? payrunData.payslips.length : 0} Employees
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Immutability Lock</p>
                  <p className="text-sm font-bold mt-1 text-slate-900">
                    {isPaid ? 'Locked (Paid)' : 'Editable (Draft/Validated)'}
                  </p>
                </div>
              </div>

              {/* Payslips Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Generated Payslips Breakdown</h3>
                {!payrunData?.payslips || payrunData.payslips.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-medium">No payslips found</div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-3 px-4">Employee</th>
                          <th className="py-3 px-4">Worked Days</th>
                          <th className="py-3 px-4">Basic</th>
                          <th className="py-3 px-4">Gross</th>
                          <th className="py-3 px-4">Net Salary</th>
                          <th className="py-3 px-4">Warnings</th>
                          <th className="py-3 px-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payrunData.payslips.map((ps, idx) => {
                          const hasWarnings = ps.warnings && ps.warnings.length > 0;
                          const targetId = ps.id || ps._id || ps.payslipId;
                          return (
                            <tr key={targetId || idx} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                                  <User className="w-3.5 h-3.5" />
                                </div>
                                <span>{ps.employeeName || ps.employeeId}</span>
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-800">
                                {ps.workedDays !== undefined && ps.workedDays !== null ? `${ps.workedDays} days` : 'Uncalculated'}
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                                {ps.basic !== null && ps.basic !== undefined ? formatCurrency(ps.basic) : '—'}
                              </td>
                              <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                                {ps.gross !== null && ps.gross !== undefined ? formatCurrency(ps.gross) : '—'}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                                {ps.net !== null && ps.net !== undefined ? formatCurrency(ps.net) : '—'}
                              </td>
                              <td className="py-3 px-4">
                                {hasWarnings ? (
                                  <div className="flex flex-wrap gap-1">
                                    {ps.warnings.map((w, wIdx) => (
                                      <span
                                        key={wIdx}
                                        className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold flex items-center gap-1"
                                      >
                                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                        <span>{w.type || w}</span>
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 font-medium">None</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => onSelectPayslip && targetId && onSelectPayslip(targetId)}
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                                  title="View Payslip Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
