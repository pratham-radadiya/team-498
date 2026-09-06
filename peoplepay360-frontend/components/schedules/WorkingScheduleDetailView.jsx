'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSchedules } from '@/hooks/useSchedules';
import { canPerformAction } from '@/lib/rbac';
import { DAYS_OF_WEEK } from '@/lib/formatters';
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
  Plus,
  Calendar,
  Building,
  Layers
} from 'lucide-react';

export default function WorkingScheduleDetailView({ id }) {
  const router = useRouter();
  const { role } = useAuthSession();
  const { fetchScheduleById, updateSchedule, deleteSchedule } = useSchedules();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    calendarType: 'Standard 40 Hours',
    company: '',
    status: 'Active',
    days: [],
  });

  const [computedTotalHours, setComputedTotalHours] = useState(null);

  const canEdit = canPerformAction(role, 'schedules', 'update');
  const canDelete = canPerformAction(role, 'schedules', 'delete');

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchScheduleById(id);
      setFormData({
        name: data.name || '',
        calendarType: data.calendarType || 'Standard',
        company: data.company || '',
        status: data.status || 'Active',
        days: data.days && data.days.length > 0 ? data.days : [],
      });
      setComputedTotalHours(data.totalWeeklyHours);
    } catch (err) {
      setError(err.message || 'Failed to load working schedule');
    } finally {
      setLoading(false);
    }
  }, [id, fetchScheduleById]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDayChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedDays = [...prev.days];
      updatedDays[index] = {
        ...updatedDays[index],
        [field]: field === 'breakMinutes' ? Number(value) : value,
      };
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddDayRow = () => {
    setFormData((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        { day: 'MON', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      ],
    }));
  };

  const handleRemoveDayRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Schedule Name is required.');
      return;
    }
    if (formData.days.length === 0) {
      setError('At least one working day slot must be defined.');
      return;
    }

    setSubmitting(true);
    try {
      await updateSchedule(id, formData);
      setSuccessMsg('Working schedule saved successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.message || 'Failed to save working schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this working schedule?')) return;
    setDeleting(true);
    try {
      await deleteSchedule(id);
      router.push('/contracts');
    } catch (err) {
      setError(err.message || 'Failed to delete schedule');
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
              { label: 'Contracts & Schedules', href: '/contracts' },
              { label: formData.name || 'Working Schedule' }
            ]}
            title={formData.name || 'Working Schedule Details'}
            subtitle={computedTotalHours ? `Weekly Total: ${computedTotalHours} hrs • ${formData.days.length} days defined` : 'Working Hours Schedule'}
            icon={<Clock className="w-5 h-5" />}
            badge={
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                formData.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {formData.status}
              </span>
            }
            backHref="/contracts"
            actions={
              <div className="flex items-center gap-2">
                {canDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || submitting}
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
              <p className="text-sm">Loading schedule configuration...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              {/* General Configuration */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  General Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Schedule Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      disabled={!canEdit}
                      required
                      placeholder="e.g. Standard 40 Hours / Week"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Calendar Type
                    </label>
                    <input
                      type="text"
                      name="calendarType"
                      value={formData.calendarType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, calendarType: e.target.value }))}
                      disabled={!canEdit}
                      placeholder="e.g. Standard, Flexible, Shift A"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                      disabled={!canEdit}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-60"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Working Hours Slots Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4 text-indigo-600" />
                      Daily Working Time Slots
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure standard operating hours and unpaid break duration per day
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      type="button"
                      onClick={handleAddDayRow}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Day Slot</span>
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase">
                      <tr>
                        <th className="px-4 py-3">Day of Week</th>
                        <th className="px-4 py-3">Work From</th>
                        <th className="px-4 py-3">Work To</th>
                        <th className="px-4 py-3">Break (Mins)</th>
                        {canEdit && <th className="px-4 py-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.days.map((slot, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5">
                            <select
                              value={slot.day}
                              onChange={(e) => handleDayChange(idx, 'day', e.target.value)}
                              disabled={!canEdit}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                            >
                              <option value="MON">Monday</option>
                              <option value="TUE">Tuesday</option>
                              <option value="WED">Wednesday</option>
                              <option value="THU">Thursday</option>
                              <option value="FRI">Friday</option>
                              <option value="SAT">Saturday</option>
                              <option value="SUN">Sunday</option>
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="time"
                              value={slot.startTime}
                              onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
                              disabled={!canEdit}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="time"
                              value={slot.endTime}
                              onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
                              disabled={!canEdit}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              max="300"
                              step="5"
                              value={slot.breakMinutes}
                              onChange={(e) => handleDayChange(idx, 'breakMinutes', e.target.value)}
                              disabled={!canEdit}
                              className="w-20 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                            />
                          </td>
                          {canEdit && (
                            <td className="px-4 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveDayRow(idx)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove day slot"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
