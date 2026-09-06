'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAttendance } from '@/hooks/useAttendance';
import { canPerformAction } from '@/lib/rbac';
import { formatDateTime, formatWorkedHours } from '@/lib/formatters';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import DetailPageHeader from '@/components/common/DetailPageHeader';
import {
  Clock,
  Save,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  User,
  Calendar,
  Building,
  Check
} from 'lucide-react';

export default function AttendanceDetailView({ id }) {
  const router = useRouter();
  const { role: currentUserRole } = useAuthSession();
  const {
    fetchAttendanceById,
    correctAttendance,
    deleteAttendance,
  } = useAttendance();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [recordData, setRecordData] = useState(null);

  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    status: 'Present',
    notes: '',
  });

  const canEdit = canPerformAction(currentUserRole, 'attendance', 'edit');
  const canDelete = canPerformAction(currentUserRole, 'attendance', 'delete');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchAttendanceById(id);
      setRecordData(data);
      setFormData({
        checkIn: data.checkIn ? new Date(data.checkIn).toISOString().slice(0, 16) : '',
        checkOut: data.checkOut ? new Date(data.checkOut).toISOString().slice(0, 16) : '',
        status: data.status || 'Present',
        notes: data.notes || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load attendance record');
    } finally {
      setLoading(false);
    }
  }, [id, fetchAttendanceById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEdit) return;

    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      const payload = {
        checkIn: formData.checkIn ? new Date(formData.checkIn).toISOString() : undefined,
        checkOut: formData.checkOut ? new Date(formData.checkOut).toISOString() : null,
        status: formData.status,
        notes: formData.notes?.trim() || null,
      };

      await correctAttendance(id, payload);
      setSuccessMsg('Attendance record corrected successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to correct attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this attendance record?')) return;
    setDeleting(true);
    try {
      await deleteAttendance(id);
      router.push('/attendance');
    } catch (err) {
      setError(err.message || 'Failed to delete record');
      setDeleting(false);
    }
  };

  const displayedEmployeeName = recordData?.employee
    ? `${recordData.employee.name || recordData.employee.firstName || 'Employee'}`
    : recordData?.employeeName || 'Employee';

  const statusBadgeColor = {
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Late: 'bg-amber-50 text-amber-700 border-amber-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
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
              { label: 'Attendance', href: '/attendance' },
              { label: `Record #${id.slice(0, 8).toUpperCase()}` }
            ]}
            title={`Attendance: ${displayedEmployeeName}`}
            subtitle={recordData?.workedHours ? `Worked Hours: ${formatWorkedHours(recordData.workedHours)}` : 'Attendance Entry'}
            icon={<Clock className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusBadgeColor}`}>
                {formData.status}
              </span>
            }
            backHref="/attendance"
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
              <p className="text-sm">Loading attendance record...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                {/* Employee Profile Summary */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{displayedEmployeeName}</h3>
                    <p className="text-xs text-slate-500">
                      {recordData?.employee?.department || 'Staff Member'} • {recordData?.employee?.jobPosition || 'Employee'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-In Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-Out Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Attendance Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Computed Total Hours
                    </label>
                    <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-800">
                      {recordData?.workedHours ? formatWorkedHours(recordData.workedHours) : '—'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Notes / Correction Reason
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    disabled={!canEdit}
                    placeholder="Reason for manual entry or punch time adjustment..."
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
