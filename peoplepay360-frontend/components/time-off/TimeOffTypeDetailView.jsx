'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useTimeOffTypes } from '@/hooks/useTimeOffTypes';
import { canPerformAction } from '@/lib/rbac';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  Tag,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  CheckSquare
} from 'lucide-react';

export default function TimeOffTypeDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchTypeById,
    updateType,
    deleteType,
  } = useTimeOffTypes();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    unit: 'Days',
    requiresAllocation: true,
    approvalRole: 'Manager',
    status: 'Active',
  });

  const canEdit = canPerformAction(currentUserRole, 'timeOff', 'create');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchTypeById(id);
      setFormData({
        name: data.name || '',
        unit: data.unit || 'Days',
        requiresAllocation: data.requiresAllocation ?? true,
        approvalRole: data.approvalRole || 'Manager',
        status: data.status || 'Active',
      });
    } catch (err) {
      setError(err.message || 'Failed to load time off type');
    } finally {
      setLoading(false);
    }
  }, [id, fetchTypeById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Policy Name is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        unit: formData.unit,
        requiresAllocation: Boolean(formData.requiresAllocation),
        approvalRole: formData.approvalRole,
        status: formData.status,
      };

      await updateType(id, payload);
      setSuccessMsg('Time off type saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to update time off type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this time off type policy?')) return;
    setDeleting(true);
    try {
      await deleteType(id);
      router.push('/time-off/types');
    } catch (err) {
      setError(err.message || 'Failed to delete time off type');
      setDeleting(false);
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
              { label: 'Time Off', href: '/time-off' },
              { label: 'Leave Types', href: '/time-off/types' },
              { label: formData.name || 'Leave Policy' }
            ]}
            title={formData.name || 'Time Off Type'}
            subtitle={`Quota Unit: ${formData.unit} • Approver: ${formData.approvalRole}`}
            icon={<Tag className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                formData.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {formData.status}
              </span>
            }
            backHref="/time-off/types"
            actions={
              <div className="flex items-center gap-2">
                {canEdit && (
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
              <p className="text-sm">Loading leave policy...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Type Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!canEdit}
                      required
                      placeholder="e.g. Paid Time Off, Sick Leave"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Duration Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="Days">Days</option>
                      <option value="Hours">Hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Approval Authority
                    </label>
                    <select
                      name="approvalRole"
                      value={formData.approvalRole}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="Manager">Direct Manager</option>
                      <option value="HR">HR Officer / Officer</option>
                      <option value="Admin">Administrator</option>
                      <option value="None">No Approval Needed (Auto-approve)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      name="requiresAllocation"
                      checked={formData.requiresAllocation}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Requires Allocation Balance
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        If checked, employees must have an allocated balance before requesting this leave type.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
