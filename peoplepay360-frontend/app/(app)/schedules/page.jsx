'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../src/components/common/PageHeader.jsx';
import StatusBadge from '../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../src/components/common/Guards.jsx';
import { PERMISSIONS } from '../../../src/lib/permissions.js';
import { mockSchedules } from '../../../src/mock/schedules.js';
import { Plus, Clock, Edit } from 'lucide-react';

export default function SchedulesPage() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setSchedules(mockSchedules); setLoading(false); }, 350);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Working Schedules"
        subtitle="Define weekly work patterns for employees"
        actions={
          <PermissionGuard permission={PERMISSIONS.SCHEDULES_CREATE}>
            <Link href="/schedules/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Schedule
            </Link>
          </PermissionGuard>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border p-5 animate-pulse h-40" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((sch) => (
            <div key={sch.id} onClick={() => router.push(`/schedules/${sch.id}`)} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">{sch.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{sch.type}</p>
                </div>
                <StatusBadge status={sch.status} size="xs" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Clock size={14} />
                  <span className="text-sm font-semibold">{sch.weeklyHours}h/week</span>
                </div>
                <span className="text-slate-300">•</span>
                <span className="text-sm text-slate-500">{sch.days.length} days/week</span>
              </div>

              {/* Day chips */}
              <div className="flex flex-wrap gap-1.5">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => {
                  const fullDay = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }[day];
                  const active = sch.days.some((d) => d.day === fullDay);
                  return (
                    <span key={day} className={`text-xs px-2 py-0.5 rounded-md font-medium ${active ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>{day}</span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
