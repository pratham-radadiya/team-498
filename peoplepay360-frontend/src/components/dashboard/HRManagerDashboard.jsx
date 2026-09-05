'use client';

import Link from 'next/link';
import KPICard from '../common/KPICard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { Users, Clock, Calendar, AlertTriangle, TrendingUp, UserCheck, Briefcase } from 'lucide-react';
import { mockHRDashboardStats, mockDepartmentOverview } from '../../mock/dashboard.js';
import { mockTimeOffRequests } from '../../mock/timeOff.js';

export default function HRManagerDashboard() {
  const stats = mockHRDashboardStats;
  const pendingLeave = mockTimeOffRequests.filter((r) => r.status === 'Pending');

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Manager Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Employee management and HR operations overview</p>
        </div>
        <div className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full font-medium">September 2026</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Employees" value={stats.totalEmployees} icon={Users} color="indigo" />
        <KPICard label="Active Employees" value={stats.activeEmployees} icon={UserCheck} color="emerald" />
        <KPICard label="On Leave" value={stats.onLeave} icon={Calendar} color="amber" note="Currently absent" />
        <KPICard label="Attendance Health" value={stats.attendanceHealth} suffix="%" icon={TrendingUp} color="cyan" note="Present today" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Pending Leave Requests</h2>
            <Link href="/time-off/requests" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          {pendingLeave.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No pending requests.</p>
          ) : (
            <div className="space-y-3">
              {pendingLeave.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{req.employeeName}</p>
                    <p className="text-xs text-slate-500">{req.timeOffTypeName} • {req.duration} days • {req.startDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">Approve</button>
                    <button className="text-xs px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium">Refuse</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contract Expirations */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming Contract Expirations</h2>
            <Link href="/contracts" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Swathi Rajan', expiry: '2026-12-31', dept: 'Finance' },
              { name: 'Karan Malhotra', expiry: '2026-10-15', dept: 'Sales' },
              { name: 'Divya Krishnan', expiry: '2026-11-30', dept: 'Sales' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-800">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.dept}</p>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <span className="text-xs text-amber-700 font-medium">{c.expiry}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Department Headcount */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Department Headcount</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {mockDepartmentOverview.map((dept) => (
            <div key={dept.department} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-indigo-600">{dept.headcount}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{dept.department}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
