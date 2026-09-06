'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { usePayslips } from '@/hooks/usePayslips';
import { canPerformAction } from '@/lib/rbac';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
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
  Loader2,
  Download,
  Building,
  Briefcase
} from 'lucide-react';

export default function PayslipDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const { fetchPayslipById, getPdfUrl, downloadPdf, deletePayslip } = usePayslips();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [payslipData, setPayslipData] = useState(null);

  const canDelete = canPerformAction(currentUserRole, 'payslips', 'delete');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchPayslipById(id);
      setPayslipData(data);
    } catch (err) {
      setError(err.message || 'Failed to load payslip details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchPayslipById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDownloadPdf = async () => {
    if (!id) return;
    try {
      setDownloading(true);
      setError('');
      if (downloadPdf) {
        await downloadPdf(id, payslipData?.employeeName || payslipData?.employee?.name);
      } else {
        const link = document.createElement('a');
        const url = getPdfUrl ? getPdfUrl(id) : `/api/payslips/${encodeURIComponent(id)}/pdf`;
        link.href = url;
        const cleanName = payslipData?.employeeName ? String(payslipData.employeeName).trim().replace(/\s+/g, '_') : id;
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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this payslip record?')) return;
    setDeleting(true);
    try {
      await deletePayslip(id);
      router.push('/payroll/payslips');
    } catch (err) {
      setError(err.message || 'Failed to delete payslip');
      setDeleting(false);
    }
  };

  const employeeName = payslipData?.employee?.name || payslipData?.employeeName || 'Employee';
  const contractRef = payslipData?.contract?.contractReference || payslipData?.contractReference || '—';

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
              { label: 'Payslips', href: '/payroll/payslips' },
              { label: employeeName }
            ]}
            title={`Salary Slip: ${employeeName}`}
            subtitle={
              (payslipData?.startDate || payslipData?.periodStart || payslipData?.payrun?.periodStart)
                ? `Pay Period: ${formatDate(payslipData.startDate || payslipData.periodStart || payslipData.payrun?.periodStart)} - ${formatDate(payslipData.endDate || payslipData.periodEnd || payslipData.payrun?.periodEnd)}`
                : 'Payslip Breakdown'
            }
            icon={<FileText className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(payslipData?.status)}`}>
                {payslipData?.status || 'Draft'}
              </span>
            }
            backHref="/payroll/payslips"
            actions={
              <div className="flex items-center gap-2">
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleting ? 'Deleting...' : 'Delete'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading || loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
                </button>
              </div>
            }
          />

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" />
              <p className="text-sm">Loading payslip breakdown...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Employee & Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-bold text-slate-900 truncate">{employeeName}</h2>
                      <p className="text-xs text-slate-500 truncate">{payslipData?.employeeEmail || 'Employee'}</p>
                      <p className="text-xs font-mono text-indigo-600 font-semibold mt-0.5 truncate">Contract: {contractRef}</p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Pay Period</span>
                    </div>
                    <div className="text-sm font-bold text-slate-900 font-mono mt-1">
                      {payslipData?.startDate || payslipData?.periodStart || payslipData?.payrun?.periodStart ? (
                        `${formatDate(payslipData.startDate || payslipData.periodStart || payslipData.payrun?.periodStart)} - ${formatDate(payslipData.endDate || payslipData.periodEnd || payslipData.payrun?.periodEnd)}`
                      ) : (
                        '—'
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate">
                      {payslipData?.payrunName || payslipData?.payrun?.name || 'Standard Payrun'}
                    </div>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Computation Structure</div>
                    <div className="text-sm font-bold text-slate-800 mt-1">
                      {payslipData?.structureName || payslipData?.salaryStructure?.name || 'Standard Structure'}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {payslipData?.workedDays !== undefined && payslipData?.workedDays !== null ? `${payslipData.workedDays} Worked Days` : ''}
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-center items-end text-right">
                    <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Net Take-Home Pay</div>
                    <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
                      {formatCurrency(payslipData?.netPay || payslipData?.net || 0)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Basic Wage</div>
                  <div className="text-xl font-bold text-slate-900 font-mono mt-1">
                    {formatCurrency(payslipData?.basicWage || 0)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Earnings</div>
                  <div className="text-xl font-bold text-indigo-700 font-mono mt-1">
                    {formatCurrency(payslipData?.grossPay || 0)}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Deductions</div>
                  <div className="text-xl font-bold text-rose-600 font-mono mt-1">
                    {formatCurrency(payslipData?.totalDeductions || 0)}
                  </div>
                </div>
              </div>

              {/* Detailed Salary Computation Lines */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  Salary Rule Line Item Breakdown
                </h3>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Rule Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Rate / Base</th>
                        <th className="px-4 py-3 text-right">Computed Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(payslipData?.lines || []).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs">
                            No computed salary lines found for this slip.
                          </td>
                        </tr>
                      ) : (
                        (payslipData?.lines || []).map((line, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-mono font-bold text-indigo-700 text-xs">
                              {line.code || line.ruleCode || 'LINE'}
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-900">
                              {line.name || line.ruleName || line.code}
                            </td>
                            <td className="px-4 py-3 text-xs">
                              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                                line.category === 'Deduction'
                                  ? 'bg-rose-50 text-rose-700'
                                  : line.category === 'Net'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {line.category || 'Allowance'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                              {line.rate ? `${line.rate}%` : line.amountType || '—'}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                              {formatCurrency(line.total !== undefined ? line.total : line.amount || 0)}
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
