'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { scheduleApi } from '../../../../src/api/scheduleApi.js';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import { Calendar, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function NewSchedulePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('Standard');
  const [days, setDays] = useState([
    { day: 'Monday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    { day: 'Tuesday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    { day: 'Wednesday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    { day: 'Thursday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
    { day: 'Friday', startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
  ]);

  const totalWeeklyHours = days.reduce((sum, d) => sum + Number(d.workHours || 0), 0);

  const handleDayChange = (index, field, value) => {
    const updated = [...days];
    updated[index][field] = value;
    if (field === 'startTime' || field === 'endTime' || field === 'breakHours') {
      const start = updated[index].startTime;
      const end = updated[index].endTime;
      const brk = Number(updated[index].breakHours || 0);
      if (start && end) {
        const [sh, sm] = start.split(':').map(Number);
        const [eh, em] = end.split(':').map(Number);
        const diff = (eh * 60 + em - (sh * 60 + sm)) / 60 - brk;
        updated[index].workHours = Math.max(0, diff);
      }
    }
    setDays(updated);
  };

  const handleAddDay = () => {
    const remainingDays = DAYS_OF_WEEK.filter((d) => !days.some((existing) => existing.day === d));
    if (remainingDays.length > 0) {
      setDays([
        ...days,
        { day: remainingDays[0], startTime: '09:00', endTime: '18:00', breakHours: 1, workHours: 8 },
      ]);
    }
  };

  const handleRemoveDay = (index) => {
    setDays(days.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await scheduleApi.createSchedule({
      name,
      type,
      weeklyHours: totalWeeklyHours,
      days,
    });
    setLoading(false);
    router.push('/schedules');
  };

  return (
    <RoleGuard allowedRoles={['ADMIN', 'HR_MANAGER']}>
      <div className="max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Link
            href="/schedules"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Working Schedule</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Define working hours, weekly shift patterns, and rest intervals.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 40 Hours Standard (Mon-Fri)"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Standard">Standard</option>
                <option value="Flexible">Flexible</option>
                <option value="Shift">Shift / Rotational</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Working Days & Shifts</h3>
                <p className="text-xs text-slate-500">Configure daily start/end times and break durations.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100">
                  Total: {totalWeeklyHours} hrs/week
                </span>
                {days.length < 7 && (
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                  >
                    <Plus size={14} /> Add Day
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2.5">
              {days.map((item, index) => (
                <div key={index} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 bg-slate-50 rounded-xl items-center text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{item.day}</span>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Start Time</label>
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">End Time</label>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-0.5">Break (Hrs)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={item.breakHours}
                      onChange={(e) => handleDayChange(index, 'breakHours', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">{item.workHours}h work</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDay(index)}
                      className="text-slate-400 hover:text-red-500 transition p-1"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/schedules"
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || !name || days.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50"
            >
              <Save size={16} />
              <span>{loading ? 'Creating...' : 'Save Schedule'}</span>
            </button>
          </div>
        </form>
      </div>
    </RoleGuard>
  );
}
