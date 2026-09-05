'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import {
  X,
  FileText,
  Printer,
  Trash2,
  AlertCircle,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function PayslipDetailModal({
  isOpen,
  onClose,
  payslipId,
  fetchPayslipById,
  getPdfUrl,
  downloadPdf,
  deletePayslip,
  currentUserRole,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [payslipData, setPayslipData] = useState(null);

  const [downloading, setDownloading] = useState(false);
  const targetId = payslipId || payslipData?.id || payslipData?._id;
  const canDelete = canPerformAction(currentUserRole, 'payslips', 'delete');

  useEffect(() => {
    if (isOpen && payslipId && payslipId !== 'undefined') {
      setLoading(true);
      setError('');
      fetchPayslipById(payslipId)
        .then((data) => {
          setPayslipData(data);
        })
        .catch((err) => setError(err.message || 'Failed to load payslip details'))
        .finally(() => setLoading(false));
    } else if (isOpen && (!payslipId || payslipId === 'undefined')) {
      setPayslipData(null);
    }
  }, [isOpen, payslipId, fetchPayslipById]);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this payslip record?')) {
      try {
        setSubmitting(true);
        await deletePayslip(targetId);
        onSuccess && onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete payslip.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const isParentPaid = payslipData?.payrunStatus === 'Paid' || payslipData?.status === 'Paid';

  const handleDownloadPdf = async () => {
    const validId = targetId && targetId !== 'undefined' ? String(targetId).trim() : null;
    if (!validId) {
      setError('Cannot download PDF: Payslip ID is missing or invalid.');
      return;
    }
    try {
      setDownloading(true);
      setError('');
      if (downloadPdf) {
        await downloadPdf(validId, payslipData?.employeeName);
      } else {
        const link = document.createElement('a');
        const url = getPdfUrl ? getPdfUrl(validId) : `/api/payslips/${encodeURIComponent(validId)}/pdf`;
        link.href = url;
        const cleanName = payslipData?.employeeName ? String(payslipData.employeeName).trim().replace(/\s+/g, '_') : validId;
        link.setAttribute('download', `Payslip_${cleanName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (err) {
      setError(err.message || 'Failed to download payslip PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Payslip — {payslipData?.employeeName || payslipData?.employeeId || 'Details'}
                </h2>
                <span className={`badge ${getStatusBadgeClass(payslipData?.status)}`}>
                  {payslipData?.status || 'Draft'}
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  {formatDate(payslipData?.periodStart)} → {formatDate(payslipData?.periodEnd)}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Print / Download PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loading || downloading || !targetId || targetId === 'undefined'}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              <span>{downloading ? 'Downloading...' : 'Print PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading payslip breakdown...</div>
          ) : (
            <div className="space-y-6">
              {/* Warnings Banner */}
              {payslipData?.warnings && payslipData.warnings.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-800 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Payslip Calculation Warnings</span>
                  </p>
                  <ul className="list-disc list-inside text-xs space-y-0.5 font-medium">
                    {payslipData.warnings.map((w, idx) => (
                      <li key={idx}>{w.message || w.type || w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Employee & Worked Days Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Employee</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    <span>{payslipData?.employeeName || payslipData?.employeeId}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Worked Days</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>{payslipData?.workedDays !== undefined ? `${payslipData.workedDays} Days` : '—'}</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Net Salary</p>
                  <p className="text-xl font-black text-indigo-900 font-mono mt-1">
                    {payslipData?.net !== null && payslipData?.net !== undefined
                      ? formatCurrency(payslipData.net)
                      : '—'}
                  </p>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Basic</p>
                  <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {payslipData?.basic !== null && payslipData?.basic !== undefined
                      ? formatCurrency(payslipData.basic)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Gross</p>
                  <p className="text-xs font-bold text-slate-900 font-mono mt-0.5">
                    {payslipData?.gross !== null && payslipData?.gross !== undefined
                      ? formatCurrency(payslipData.gross)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Net Salary</p>
                  <p className="text-xs font-bold text-emerald-700 font-mono mt-0.5">
                    {payslipData?.net !== null && payslipData?.net !== undefined
                      ? formatCurrency(payslipData.net)
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Payrun Status</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{payslipData?.payrunStatus || 'Draft'}</p>
                </div>
              </div>

              {/* Salary Computation Lines Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Salary Computation Breakdown</h3>
                {!payslipData?.lines || payslipData.lines.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    Financials not computed yet. Run "Compute Salary Rules" on the parent payrun.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                          <th className="py-2.5 px-3 w-12">Seq</th>
                          <th className="py-2.5 px-3">Rule Name</th>
                          <th className="py-2.5 px-3">Code</th>
                          <th className="py-2.5 px-3">Category</th>
                          <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payslipData.lines.map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono text-slate-500 font-bold">{line.sequence}</td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">{line.name}</td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">{line.code}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold text-[11px]">
                                {line.category}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(line.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isParentPaid && canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Payslip</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
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
    </div>
  );
}
