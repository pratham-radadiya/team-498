'use client';

import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK } from '@/lib/formatters';
import { X, Clock, Plus, Trash2, Save, AlertCircle, Calendar } from 'lucide-react';

export default function WorkingScheduleFormModal({
  isOpen,
  onClose,
  scheduleId,
  fetchScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  onSuccess,
}) {
  const isCreate = !scheduleId;
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    calendarType: 'Standard 40 Hours',
    company: '',
    status: 'Active',
    days: [
      { day: 'MON', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      { day: 'TUE', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      { day: 'WED', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      { day: 'THU', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
      { day: 'FRI', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
    ],
  });

  const [computedTotalHours, setComputedTotalHours] = useState(null);

  useEffect(() => {
    if (isOpen && scheduleId) {
      setLoading(true);
      setError('');
      fetchScheduleById(scheduleId)
        .then((data) => {
          setFormData({
            name: data.name || '',
            calendarType: data.calendarType || 'Standard',
            company: data.company || '',
            status: data.status || 'Active',
            days: data.days && data.days.length > 0 ? data.days : [],
          });
          setComputedTotalHours(data.totalWeeklyHours);
        })
        .catch((err) => setError(err.message || 'Failed to load working schedule'))
        .finally(() => setLoading(false));
    } else if (isOpen && isCreate) {
      setFormData({
        name: '',
        calendarType: 'Standard 40 Hours',
        company: '',
        status: 'Active',
        days: [
          { day: 'MON', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          { day: 'TUE', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          { day: 'WED', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          { day: 'THU', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
          { day: 'FRI', startTime: '09:00', endTime: '17:00', breakMinutes: 60 },
        ],
      });
      setComputedTotalHours(null);
      setError('');
    }
  }, [isOpen, scheduleId, isCreate, fetchScheduleById]);

  if (!isOpen) return null;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Schedule Name is required.');
      return;
    }

    if (formData.days.length === 0) {
      setError('At least 1 working day entry is required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        calendarType: formData.calendarType?.trim() || null,
        company: formData.company?.trim() || null,
        status: formData.status,
        days: formData.days.map((d) => ({
          day: d.day,
          startTime: d.startTime,
          endTime: d.endTime,
          breakMinutes: Number(d.breakMinutes || 0),
        })),
      };

      let res;
      if (isCreate) {
        res = await createSchedule(payload);
      } else {
        res = await updateSchedule(scheduleId, payload);
      }

      if (res?.totalWeeklyHours !== undefined) {
        setComputedTotalHours(res.totalWeeklyHours);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save working schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this working schedule?')) {
      try {
        setSubmitting(true);
        await deleteSchedule(scheduleId);
        onSuccess();
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to delete schedule.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const inputClassName =
    'w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-slate-900 text-sm font-medium focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 shadow-sm transition-all outline-none block';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {isCreate ? 'Create Working Schedule' : `Edit Schedule — ${formData.name}`}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Define 7-day working hours pattern & automatic weekly hour computation
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
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 text-sm font-medium">Loading schedule details...</div>
          ) : (
            <>
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">
                    Schedule Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Standard 40 Hours/Week"
                    required
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Calendar Type</label>
                  <input
                    type="text"
                    name="calendarType"
                    value={formData.calendarType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, calendarType: e.target.value }))}
                    placeholder="e.g. Standard, Night Shift"
                    className={inputClassName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className={inputClassName}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Working Pattern Days Table */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span>Weekly Working Hours Pattern</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddDayRow}
                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Working Day</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Day of Week</th>
                        <th className="px-4 py-3">Start Time (24h)</th>
                        <th className="px-4 py-3">End Time (24h)</th>
                        <th className="px-4 py-3">Break (Mins)</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {formData.days.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-2.5">
                            <select
                              value={row.day}
                              onChange={(e) => handleDayChange(idx, 'day', e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                            >
                              {DAYS_OF_WEEK.map((d) => (
                                <option key={d.key} value={d.key}>
                                  {d.label} ({d.key})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="time"
                              value={row.startTime}
                              onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
                              required
                              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="time"
                              value={row.endTime}
                              onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
                              required
                              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              min="0"
                              value={row.breakMinutes}
                              onChange={(e) => handleDayChange(idx, 'breakMinutes', e.target.value)}
                              className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveDayRow(idx)}
                              disabled={formData.days.length <= 1}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Server-Computed Total Weekly Hours Footer Display */}
                {computedTotalHours !== null && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-indigo-900 text-xs font-bold">
                    <span>Server Computed Total Weekly Hours:</span>
                    <span className="text-base font-mono font-extrabold text-indigo-600">{computedTotalHours} Hours/Week</span>
                  </div>
                )}
              </div>
            </>
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
                <span>Delete Schedule</span>
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
                  <span>{isCreate ? 'Create Schedule' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
