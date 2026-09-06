'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useTimeOffRequests } from '@/hooks/useTimeOffRequests';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOffTypes } from '@/hooks/useTimeOffTypes';
import { canPerformAction } from '@/lib/rbac';
import { formatDate, sanitizeDateInput } from '@/lib/formatters';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  Calendar,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  User,
  Tag,
  FileText
} from 'lucide-react';

export default function RequestDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchRequestById,
    updateRequest,
    approveRequest,
    refuseRequest,
    deleteRequest,
  } = useTimeOffRequests();

  const { options: employeeOptions, fetchOptions: fetchEmployeeOptions } = useEmployees();
  const { types: typeOptions, fetchTypes: fetchTypeOptions } = useTimeOffTypes();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    typeId: '',
    typeName: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'To Approve',
  });

  const canApprove =
    canPerformAction(currentUserRole, 'timeOffRequests', 'approve') ||
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'HR_MANAGER' ||
    currentUserRole === 'HR_PAYROLL_MANAGER' ||
    currentUserRole === 'HR_PAYROLL_USER';

  const canEdit =
    canPerformAction(currentUserRole, 'timeOffRequests', 'edit') ||
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'HR_MANAGER';

  const canDelete =
    canPerformAction(currentUserRole, 'timeOffRequests', 'delete') ||
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'HR_MANAGER';

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      fetchEmployeeOptions();
      fetchTypeOptions();
      const data = await fetchRequestById(id);
      setFormData({
        employeeId: data.employeeId || '',
        employeeName: data.employee?.name || data.employeeName || '',
        typeId: data.typeId || '',
        typeName: data.type?.name || data.typeName || '',
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
        reason: data.reason || '',
        status: data.status || 'To Approve',
      });
    } catch (err) {
      setError(err.message || 'Failed to load request details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchRequestById, fetchEmployeeOptions, fetchTypeOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const durationDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    let { name, value, type } = e.target;
    if (type === 'date' && value) {
      value = sanitizeDateInput(value);
    }
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'startDate' && (!prev.endDate || prev.endDate < value)) {
        next.endDate = value;
      }
      return next;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.startDate || !formData.endDate) {
      setError('Start and End dates are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (updateRequest) {
        await updateRequest(id, formData);
      }
      setSuccessMsg('Leave request updated successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await approveRequest(id);
      setFormData((prev) => ({ ...prev, status: 'Approved' }));
      setSuccessMsg('Leave request has been approved.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefuse = async () => {
    setActionLoading(true);
    setError('');
    try {
      await refuseRequest(id);
      setFormData((prev) => ({ ...prev, status: 'Refused' }));
      setSuccessMsg('Leave request has been refused.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to refuse request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    setDeleting(true);
    try {
      await deleteRequest(id);
      router.push('/time-off/requests');
    } catch (err) {
      setError(err.message || 'Failed to delete request');
      setDeleting(false);
    }
  };

  const statusBadgeColor = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'To Approve': 'bg-amber-50 text-amber-700 border-amber-200',
    Refused: 'bg-rose-50 text-rose-700 border-rose-200',
  }[formData.status] || 'bg-slate-100 text-slate-700 border-slate-200';

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
              { label: 'Time Off', href: '/time-off' },
              { label: 'Requests', href: '/time-off/requests' },
              { label: `REQ-${id.slice(0, 8).toUpperCase()}` }
            ]}
            title={formData.employeeName ? `${formData.employeeName}'s Time Off` : 'Time Off Request'}
            subtitle={formData.typeName ? `${formData.typeName} • ${durationDays} Day(s)` : 'Leave Application'}
            icon={<Calendar className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeColor}`}>
                {formData.status}
              </span>
            }
            backHref="/time-off/requests"
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                {canApprove && (
                  <>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={actionLoading || formData.status === 'Approved'}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                        formData.status === 'Approved'
                          ? 'bg-emerald-700 opacity-70 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                      }`}
                      title="Approve / Accept leave request"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>{formData.status === 'Approved' ? 'Approved' : 'Accept / Approve'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRefuse}
                      disabled={actionLoading || formData.status === 'Refused'}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 ${
                        formData.status === 'Refused'
                          ? 'bg-rose-700 opacity-70 cursor-default'
                          : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                      }`}
                      title="Refuse / Reject leave request"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      <span>{formData.status === 'Refused' ? 'Refused' : 'Reject / Refuse'}</span>
                    </button>
                  </>
                )}

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

                {canEdit && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting || loading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{submitting ? 'Saving...' : 'Save Changes'}</span>
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
              <p className="text-sm">Loading leave request details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* Approval Status Banner */}
              <div className={`p-4 rounded-2xl border flex items-center gap-3 shadow-sm ${
                formData.status === 'Approved'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : formData.status === 'Refused'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                {formData.status === 'Approved' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : formData.status === 'Refused' ? (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider">
                    Approval Status: {formData.status}
                  </div>
                  <div className="text-xs opacity-80">
                    {formData.status === 'To Approve'
                      ? 'This leave application is pending manager review.'
                      : `This application was marked as ${formData.status}.`}
                  </div>
                </div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Employee & Leave Type Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Applicant & Leave Type
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Employee
                      </label>
                      <select
                        name="employeeId"
                        value={formData.employeeId}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        {(employeeOptions?.employees || employeeOptions || []).map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.name} ({e.department || 'General'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Time Off Type
                      </label>
                      <select
                        name="typeId"
                        value={formData.typeId}
                        onChange={handleChange}
                        disabled={!canEdit}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        {(typeOptions || []).map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Duration & Dates */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Leave Schedule & Duration
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        disabled={!canEdit}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        disabled={!canEdit}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Calculated Duration
                      </label>
                      <div className="px-3.5 py-2 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-indigo-700 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>{durationDays} Day{durationDays !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reason / Description
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={!canEdit}
                    placeholder="Provide details regarding this leave request..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
