'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { getScheduleById } from '../../../../src/mock/schedules.js';
import { ArrowLeft, Clock } from 'lucide-react';

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setSchedule(getScheduleById(id)); setLoading(false); }, 300);
  }, [id]);

  if (loading) return <div className="bg-white rounded-2xl border p-8 animate-pulse h-64" />;
  if (!schedule) return <div className="text-center py-20 text-slate-400">Schedule not found.</div>;

  const totalComputedHours = schedule.days.reduce((sum, d) => sum + (d.workHours || 0), 0);

  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition text-sm font-medium">
        <ArrowLeft size={16} /> Back to Schedules
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{schedule.name}</h1>
            <p className="text-slate-500 text-sm mt-1">{schedule.type} • {schedule.company}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-sm font-semibold">
              <Clock size={14} />
              {totalComputedHours}h / week
            </div>
            <StatusBadge status={schedule.status} />
          </div>
        </div>

        {/* Weekly table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Day', 'Start Time', 'End Time', 'Break (hrs)', 'Work Hours'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day) => {
                const entry = schedule.days.find((d) => d.day === day);
                return (
                  <tr key={day} className={entry ? 'hover:bg-slate-50' : 'opacity-40'}>
                    <td className="px-4 py-3 text-sm font-medium text-slate-700">{day}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry?.startTime || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry?.endTime || '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{entry?.breakHours ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">{entry?.workHours ? `${entry.workHours}h` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                <td colSpan={4} className="px-4 py-3 text-sm font-bold text-indigo-700">Total Weekly Hours</td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-700">{totalComputedHours}h</td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2 italic">Total hours are automatically computed from the day configuration.</p>
      </div>
    </div>
  );
}
