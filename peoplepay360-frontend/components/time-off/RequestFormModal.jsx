'use client';

import { useState, useEffect, useMemo } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { formatDate, sanitizeDateInput } from '@/lib/formatters';
import { X, Calendar, Save, Trash2, AlertCircle, ChevronDown, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function RequestFormModal({
  isOpen,
  onClose,
  requestId,
  fetchRequestById,
  createRequest,
  approveRequest,
  refuseRequest,
  deleteRequest,
  employeeOptions = [],
  typeOptions = [],
  currentUserRole,
  onSuccess,
}) {
  const isCreate = !requestId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canApprove = canPerformAction(currentUserRole, 'timeOff', 'approve');

  const [formData, setFormData] = useState({
    employeeId: '',
    typeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'To Approve',
  });

  useEffect(() => {
    if (isOpen && requestId) {
      setLoading(true);
      setError('');
      fetchRequestById(requestId)
        .then((data) => {
          setFormData({
            employeeId: data.employeeId || '',
            typeId: data.typeId || '',
            startDate: data.startDate ? data.startDate.split('T')[0] : '',
            endDate: data.endDate ? data.endDate.split('T')[0] : '',
            reason: data.reason || '',
            status: data.status || 'To Approve',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load request details'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        employeeId: employeeOptions.length > 0 ? employeeOptions[0].id : '',
        typeId: typeOptions.length > 0 ? typeOptions[0].id : '',
        startDate: today,
        endDate: today,
        reason: '',
        status: 'To Approve',
      });
      setError('');
    }
  }, [isOpen, requestId, isCreate, fetchRequestById, employeeOptions, typeOptions]);

  const durationDays = useMemo(() => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [formData.startDate, formData.endDate]);

  if (!isOpen) return null;

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
    if (!formData.startDate || !formData.endDate) {
      setError('Start date and End date are required.');
      return;
    }
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date cannot be later than End date.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        typeId: formData.typeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason?.trim() || null,
      };

      if (isCreate) {
        await createRequest(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit time off request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await approveRequest(requestId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to approve request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefuse = async () => {
    try {
      setSubmitting(true);
      await refuseRequest(requestId);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to refuse request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this time off request?')) {
      try {
        setSubmitting(true);
        await deleteRequest(requestId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete request.');
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
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Submit Time Off Request' : 'Time Off Request Details'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {isCreate
                  ? 'Request leave days backed by active allocation policy'
                  : `Status: ${formData.status}`}
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
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading request details...</div>
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
                    disabled={!isCreate}
                    className={`${selectClassName} ${!isCreate ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
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

              {/* Time Off Type */}
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
                    disabled={!isCreate}
                    className={`${selectClassName} ${!isCreate ? 'disabled:opacity-60 disabled:cursor-not-allowed' : ''}`}
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

              {/* Date Range */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Request Period & Duration
                  </span>
                  {durationDays > 0 && (
                    <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-2xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: {durationDays} Day{durationDays !== 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      min="1900-01-01"
                      max="2100-12-31"
                      required
                      disabled={!isCreate}
                      className={`${inputClassName} ${!isCreate ? 'disabled:opacity-60' : ''}`}
                    />
                    {formData.startDate && (
                      <p className="text-[11px] font-semibold text-indigo-600 mt-1 pl-1">
                        Starts: {formatDate(formData.startDate)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      placeholder="YYYY-MM-DD"
                      min={formData.startDate || "1900-01-01"}
                      max="2100-12-31"
                      required
                      disabled={!isCreate}
                      className={`${inputClassName} ${!isCreate ? 'disabled:opacity-60' : ''}`}
                    />
                    {formData.endDate && (
                      <p className="text-[11px] font-semibold text-indigo-600 mt-1 pl-1">
                        Ends: {formatDate(formData.endDate)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-800 mb-2">Reason / Comments</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows={3}
                  disabled={!isCreate}
                  placeholder="Explain reason for time off request..."
                  className={`${inputClassName} ${!isCreate ? 'disabled:opacity-60' : ''}`}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {!isCreate && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Request</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border-2 border-slate-300 hover:bg-slate-100 text-slate-700 rounded-2xl text-sm font-bold transition-all shadow-sm"
            >
              Close
            </button>

            {!isCreate && canApprove && (formData.status === 'To Approve' || formData.status === 'Pending') && (
              <>
                <button
                  type="button"
                  onClick={handleRefuse}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Refuse</span>
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve</span>
                </button>
              </>
            )}

            {isCreate && (
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
                    <span>Submit Request</span>
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
