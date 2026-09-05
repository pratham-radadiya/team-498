'use client';

import { useState, useEffect } from 'react';
import { canPerformAction } from '@/lib/rbac';
import { formatDateTime, formatWorkedHours } from '@/lib/formatters';
import { X, Clock, Save, Trash2, AlertCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function AttendanceFormModal({
  isOpen,
  onClose,
  recordId,
  fetchAttendanceById,
  correctAttendance,
  deleteAttendance,
  currentUserRole,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [recordData, setRecordData] = useState(null);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: '',
  });

  const canEdit = canPerformAction(currentUserRole, 'attendance', 'update');

  useEffect(() => {
    if (isOpen && recordId) {
      setLoading(true);
      setError('');
      fetchAttendanceById(recordId)
        .then((data) => {
          setRecordData(data);
          setFormData({
            checkIn: data.checkIn ? new Date(data.checkIn).toISOString().slice(0, 16) : '',
            checkOut: data.checkOut ? new Date(data.checkOut).toISOString().slice(0, 16) : '',
            status: data.status || 'Present',
            notes: data.notes || '',
          });
        })
        .catch((err) => setError(err.message || 'Failed to load attendance details'))
        .finally(() => setLoading(false));
    }
  }, [isOpen, recordId, fetchAttendanceById]);

  if (!isOpen || !recordId) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!canEdit) return;

    setSubmitting(true);
    try {
      const payload = {
        checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : undefined,
        checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
        status: formData.status,
        notes: formData.notes?.trim() || null,
      };

      await correctAttendance(recordId, payload);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update attendance correction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      try {
        setSubmitting(true);
        await deleteAttendance(recordId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete attendance record.');
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
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Attendance Record Details
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {canEdit ? 'Perform manual correction on check-in/out timestamps' : 'View session log details'}
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
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading attendance details...</div>
          ) : (
            <>
              {/* Server Calculated Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-xs text-slate-500 font-semibold block uppercase tracking-wider">Worked Hours</span>
                  <span className="text-xl font-extrabold font-mono text-slate-900 mt-1 block">
                    {formatWorkedHours(recordData?.workedHours)}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                  <span className="text-xs text-amber-700 font-semibold block uppercase tracking-wider">Overtime</span>
                  <span className="text-xl font-extrabold font-mono text-amber-800 mt-1 block">
                    {formatWorkedHours(recordData?.overtime)}
                  </span>
                </div>
              </div>

              {/* Timestamp Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Check In Timestamp</label>
                  <input
                    type="datetime-local"
                    value={formData.checkIn}
                    onChange={(e) => setFormData((prev) => ({ ...prev, checkIn: e.target.value }))}
                    disabled={!canEdit}
                    className={`${inputClassName} font-mono ${!canEdit ? 'disabled:opacity-60' : ''}`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Check Out Timestamp</label>
                  <input
                    type="datetime-local"
                    value={formData.checkOut}
                    onChange={(e) => setFormData((prev) => ({ ...prev, checkOut: e.target.value }))}
                    disabled={!canEdit}
                    className={`${inputClassName} font-mono ${!canEdit ? 'disabled:opacity-60' : ''}`}
                  />
                  {canEdit && (
                    <p className="text-xs text-slate-500 mt-1">Clear to re-open active session.</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Attendance Status</label>
                  <div className="relative">
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      disabled={!canEdit}
                      className={`${selectClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-800 mb-2">Notes & Corrections</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    disabled={!canEdit}
                    rows={3}
                    placeholder="Audit reason for manual correction..."
                    className={`${inputClassName} ${!canEdit ? 'disabled:opacity-60' : ''}`}
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            {canEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border-2 border-red-200 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Record</span>
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
                    <span>Save Correction</span>
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
