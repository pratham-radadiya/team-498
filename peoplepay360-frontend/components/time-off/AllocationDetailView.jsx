'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAllocations } from '@/hooks/useAllocations';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeOffTypes } from '@/hooks/useTimeOffTypes';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  Award,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Tag,
  Calendar
} from 'lucide-react';

export default function AllocationDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchAllocationById,
    updateAllocation,
    deleteAllocation,
  } = useAllocations();

  const { options: employeeOptions, fetchOptions: fetchEmployeeOptions } = useEmployees();
  const { types: typeOptions, fetchTypes: fetchTypeOptions } = useTimeOffTypes();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    employeeId: '',
    employeeName: '',
    typeId: '',
    typeName: '',
    numberOfDays: 10,
    reason: '',
    status: 'Approved',
  });

  const canManage =
    canPerformAction(currentUserRole, 'timeOffAllocations', 'edit') ||
    currentUserRole === 'ADMIN' ||
    currentUserRole === 'HR_MANAGER';

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      fetchEmployeeOptions();
      fetchTypeOptions();
      const data = await fetchAllocationById(id);
      setFormData({
        employeeId: data.employeeId || '',
        employeeName: data.employee?.name || data.employeeName || '',
        typeId: data.typeId || '',
        typeName: data.type?.name || data.typeName || '',
        numberOfDays: data.numberOfDays !== undefined ? data.numberOfDays : 10,
        reason: data.reason || '',
        status: data.status || 'Approved',
      });
    } catch (err) {
      setError(err.message || 'Failed to load allocation details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchAllocationById, fetchEmployeeOptions, fetchTypeOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.numberOfDays || Number(formData.numberOfDays) <= 0) {
      setError('Allocated days must be a positive number.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        typeId: formData.typeId,
        numberOfDays: Number(formData.numberOfDays),
        reason: formData.reason?.trim() || null,
        status: formData.status,
      };

      await updateAllocation(id, payload);
      setSuccessMsg('Leave allocation saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update allocation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this allocation record?')) return;
    setDeleting(true);
    try {
      await deleteAllocation(id);
      router.push('/time-off/allocations');
    } catch (err) {
      setError(err.message || 'Failed to delete allocation');
      setDeleting(false);
    }
  };

  const statusBadgeColor = {
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
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
              { label: 'Allocations', href: '/time-off/allocations' },
              { label: `ALL-${id.slice(0, 8).toUpperCase()}` }
            ]}
            title={formData.employeeName ? `${formData.employeeName}'s Allocation` : 'Time Off Allocation'}
            subtitle={formData.typeName ? `${formData.typeName} • ${formData.numberOfDays} Days Granted` : 'Leave Balance Grant'}
            icon={<Award className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeColor}`}>
                {formData.status}
              </span>
            }
            backHref="/time-off/allocations"
            actions={
              <div className="flex items-center gap-2">
                {canManage && (
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

                {canManage && (
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
              <p className="text-sm">Loading allocation details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Employee & Type Selection */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-600" />
                    Beneficiary & Policy Type
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
                        disabled={!canManage}
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
                        Time Off Policy Type
                      </label>
                      <select
                        name="typeId"
                        value={formData.typeId}
                        onChange={handleChange}
                        disabled={!canManage}
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

                {/* Days and Status */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    Quota & Approval Status
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Allocated Days (Quota) *
                      </label>
                      <input
                        type="number"
                        name="numberOfDays"
                        min="0.5"
                        max="365"
                        step="0.5"
                        value={formData.numberOfDays}
                        onChange={handleChange}
                        disabled={!canManage}
                        required
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        disabled={!canManage}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Draft">Draft</option>
                        <option value="Refused">Refused</option>
                      </select>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Reason */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Allocation Reason / Notes
                  </label>
                  <textarea
                    name="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={handleChange}
                    disabled={!canManage}
                    placeholder="e.g. Annual balance grant for FY2026..."
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
