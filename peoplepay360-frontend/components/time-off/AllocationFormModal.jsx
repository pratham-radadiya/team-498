'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { X, Award, Save, Trash2, AlertCircle, ChevronDown } from 'lucide-react';

export default function AllocationFormModal({
  isOpen,
  onClose,
  allocationId,
  fetchAllocationById,
  createAllocation,
  updateAllocation,
  deleteAllocation,
  employeeOptions = [],
  typeOptions = [],
  currentUserRole,
  onSuccess,
}) {
  const isCreate = !allocationId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canManage = canPerformAction(currentUserRole, 'timeOff', 'approve');

  const [formData, setFormData] = useState({
    employeeId: '',
    typeId: '',
    numberOfDays: 10,
    reason: '',
    status: 'Approved',
  });

  useEffect(() => {
    if (isOpen && allocationId) {
      setLoading(true);
      setError('');
      fetchAllocationById(allocationId)
        .then((data) => {
          setFormData({
            employeeId: data.employeeId || '',
            typeId: data.typeId || '',
            numberOfDays: data.numberOfDays !== undefined ? data.numberOfDays : 10,
            reason: data.reason || '',
            status: data.status || 'Approved',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load allocation details'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
        employeeId: employeeOptions.length > 0 ? employeeOptions[0].id : '',
        typeId: typeOptions.length > 0 ? typeOptions[0].id : '',
        numberOfDays: 10,
        reason: '',
        status: 'Approved',
      });
      setError('');
    }
  }, [isOpen, allocationId, isCreate, fetchAllocationById, employeeOptions, typeOptions]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId) {
      setError('Employee selection is required.');
      return;
    }
    if (!formData.typeId) {
      setError('Time Off Policy Type is required.');
      return;
    }
    if (!formData.numberOfDays || Number(formData.numberOfDays) <= 0) {
      setError('Number of Days must be a positive number.');
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

      if (isCreate) {
        await createAllocation(payload);
      } else {
        await updateAllocation(allocationId, payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save allocation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this allocation?')) {
      try {
        setSubmitting(true);
        await deleteAllocation(allocationId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete allocation.');
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
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Grant Leave Allocation' : 'Edit Allocation Details'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Allocate yearly or special leave entitlement to employees
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
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading allocation details...</div>
          ) : (
            <div className="space-y-6">
              {/* Employee Picker */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                    disabled={!isCreate || !canManage}
                    className={`${selectClassName} ${!isCreate || !canManage ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
                  >
                    <option value="">Select Employee</option>
                    {employeeOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label} ({opt.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Time Off Type & Days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Time Off Policy Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="typeId"
                      value={formData.typeId}
                      onChange={handleChange}
                      required
                      disabled={!isCreate || !canManage}
                      className={`${selectClassName} ${!isCreate || !canManage ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
                    >
                      <option value="">Select Policy Type</option>
                      {typeOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} ({opt.unit})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Allocated Days <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="numberOfDays"
                    value={formData.numberOfDays}
                    onChange={handleChange}
                    required
                    min="0.5"
                    step="0.5"
                    disabled={!canManage}
                    className={`${inputClassName} font-bold text-indigo-600 ${!canManage ? 'disabled:opacity-60' : ''}`}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={!canManage}
                    className={`${selectClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                    <option value="Refused">Refused</option>
                  </select>
                  <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Allocation Reason / Description</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  disabled={!canManage}
                  placeholder="e.g. Annual Leave Allocation 2026, Public Holiday Compensation"
                  className={`${inputClassName} ${!canManage ? 'disabled:opacity-60' : ''}`}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && canManage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Allocation</span>
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
            {canManage && (
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
                    <span>{isCreate ? 'Grant Allocation' : 'Save Changes'}</span>
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
