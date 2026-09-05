'use client';

import Link from 'next/link';
import { Calendar, Clock, Users, BarChart3 } from 'lucide-react';
import KPICard from '../../../src/components/common/KPICard.jsx';
import { getTimeOffSummary } from '../../../src/mock/timeOff.js';
import { mockTimeOffRequests } from '../../../src/mock/timeOff.js';

export default function TimeOffPage() {
  const summary = getTimeOffSummary();
  const pending = mockTimeOffRequests.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Off</h1>
          <p className="text-slate-500 text-sm mt-1">Manage leave requests, allocations, and leave types</p>
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Requests', href: '/time-off/requests', icon: Calendar, color: 'bg-indigo-100 text-indigo-600', desc: 'Submit & manage leave' },
          { label: 'Allocations', href: '/time-off/allocations', icon: Users, color: 'bg-emerald-100 text-emerald-600', desc: 'Leave balances' },
          { label: 'Leave Types', href: '/time-off/types', icon: BarChart3, color: 'bg-violet-100 text-violet-600', desc: 'Configure leave policies' },
          { label: 'Pending Approval', href: '/time-off/requests?status=Pending', icon: Clock, color: 'bg-amber-100 text-amber-600', desc: `${pending.length} pending` },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-indigo-300 transition group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon size={20} />
            </div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-600 transition">{item.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Approved Days (Period)" value={summary.approvedDays} icon={Calendar} color="emerald" />
        <KPICard label="Pending Requests" value={summary.pendingRequests} icon={Clock} color="amber" />
        <KPICard label="Upcoming Time Off" value={summary.upcoming.length} icon={Users} color="violet" />
      </div>

      {/* By Type */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Leave Summary by Type</h2>
        <div className="space-y-4">
          {summary.byType.map((t) => (
            <div key={t.type} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="font-medium text-slate-800 text-sm">{t.type}</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <span className="text-emerald-600 font-semibold">{t.approved}</span>
                  <p className="text-xs text-slate-400">Approved</p>
                </div>
                <div className="text-center">
                  <span className="text-amber-600 font-semibold">{t.pending}</span>
                  <p className="text-xs text-slate-400">Pending</p>
                </div>
                {t.remaining !== null && (
                  <div className="text-center">
                    <span className="text-indigo-600 font-semibold">{t.remaining}</span>
                    <p className="text-xs text-slate-400">Remaining</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Upcoming Time Off</h2>
        <div className="space-y-2">
          {summary.upcoming.map((u, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{u.employeeName}</p>
                <p className="text-xs text-slate-400">{u.type}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-700">{u.startDate}</p>
                <p className="text-xs text-slate-400">{u.days} days</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
