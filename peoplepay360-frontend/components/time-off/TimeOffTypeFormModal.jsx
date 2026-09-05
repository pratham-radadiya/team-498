'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { X, Tag, Save, Trash2, AlertCircle, ChevronDown } from 'lucide-react';

export default function TimeOffTypeFormModal({
  isOpen,
  onClose,
  typeId,
  fetchTypeById,
  createType,
  updateType,
  deleteType,
  currentUserRole,
  onSuccess,
}) {
  const isCreate = !typeId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    unit: 'Days',
    requiresAllocation: true,
    approvalRole: 'Manager',
    status: 'Active',
  });

  const canEdit = canPerformAction(currentUserRole, 'timeOff', 'create');

  useEffect(() => {
    if (isOpen && typeId) {
      setLoading(true);
      setError('');
      fetchTypeById(typeId)
        .then((data) => {
          setFormData({
            name: data.name || '',
            unit: data.unit || 'Days',
            requiresAllocation: data.requiresAllocation ?? true,
            approvalRole: data.approvalRole || 'Manager',
            status: data.status || 'Active',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load time off type'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
        name: '',
        unit: 'Days',
        requiresAllocation: true,
        approvalRole: 'Manager',
        status: 'Active',
      });
      setError('');
    }
  }, [isOpen, typeId, isCreate, fetchTypeById]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Type Name is required.');
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

      if (isCreate) {
        await createType(payload);
      } else {
        await updateType(typeId, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save time off type.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this time off policy type?')) {
      try {
        setSubmitting(true);
        await deleteType(typeId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete type.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const inputClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  const selectClassName =
    'w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-semibold appearance-none cursor-pointer pr-10 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all block outline-none';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Create Time Off Type' : 'Edit Policy Type'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Configure leave policy unit, allocation constraints, and approval role
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {error && (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3 text-red-700 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading type details...</div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Policy Type Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Paid Time Off (PTO), Sick Leave"
                  required
                  disabled={!canEdit}
                  className={`${inputClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Unit</label>
                  <div className="relative">
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className={`${selectClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                    >
                      <option value="Days">Days</option>
                      <option value="Hours">Hours</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Approval Role</label>
                  <div className="relative">
                    <select
                      name="approvalRole"
                      value={formData.approvalRole}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className={`${selectClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                    >
                      <option value="Manager">Manager</option>
                      <option value="Officer">Officer (HR Staff)</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Requires Allocation Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Requires Allocation Balance</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    If enabled, requests require an Approved allocation balance to submit.
                  </p>
                </div>
                <input
                  type="checkbox"
                  name="requiresAllocation"
                  checked={formData.requiresAllocation}
                  onChange={handleChange}
                  disabled={!canEdit}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={!canEdit}
                    className={`${selectClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Type</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{isCreate ? 'Create Type' : 'Save Changes'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
