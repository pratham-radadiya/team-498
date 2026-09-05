'use client';

import { useAuth } from '../../context/AuthContext.jsx';
import KPICard from '../common/KPICard.jsx';
import StatusBadge from '../common/StatusBadge.jsx';
import { Clock, CheckCircle, Calendar, FileText, User } from 'lucide-react';
import { mockTimeOffRequests, mockAllocations } from '../../mock/timeOff.js';
import { mockAttendance } from '../../mock/attendance.js';
import { mockPayslips } from '../../mock/payroll.js';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const myRequests = mockTimeOffRequests.filter((r) => r.employeeId === user?.employeeId);
  const myAllocations = mockAllocations.filter((a) => a.employeeId === user?.employeeId);
  const myAttendance = mockAttendance.filter((a) => a.employeeId === user?.employeeId).slice(0, 7);
  const myPayslips = mockPayslips.filter((p) => p.employeeId === user?.employeeId);
  const pendingRequests = myRequests.filter((r) => r.status === 'Pending');
  const ptoAlloc = myAllocations.find((a) => a.timeOffTypeId === 'TOT001');

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-indigo-100 text-sm">Here's your HR overview for today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Leave Balance" value={ptoAlloc?.remaining ?? 0} suffix=" days" icon={Calendar} color="indigo" note="Paid Time Off" />
        <KPICard label="Pending Requests" value={pendingRequests.length} icon={Clock} color="amber" note="Awaiting approval" />
        <KPICard label="Worked Days (Aug)" value={22} icon={CheckCircle} color="emerald" note="Present this month" />
        <KPICard label="Available Payslips" value={myPayslips.length} icon={FileText} color="violet" note="View your payslips" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Recent Attendance</h2>
          {myAttendance.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No attendance records yet.</p>
          ) : (
            <div className="space-y-2">
              {myAttendance.map((att) => (
                <div key={att.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{att.date}</p>
                    <p className="text-xs text-slate-400">{att.checkIn?.split(' ')[1]} — {att.checkOut?.split(' ')[1] || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">{att.workedHours}h</span>
                    <StatusBadge status={att.status} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Leave Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">My Leave Requests</h2>
          {myRequests.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No leave requests yet.</p>
          ) : (
            <div className="space-y-2">
              {myRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{req.timeOffTypeName}</p>
                    <p className="text-xs text-slate-400">{req.startDate} to {req.endDate} • {req.duration} days</p>
                  </div>
                  <StatusBadge status={req.status} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Balances */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Leave Balances</h2>
        <div className="space-y-4">
          {myAllocations.map((alloc) => (
            <div key={alloc.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">{alloc.timeOffTypeName}</span>
                <span className="text-sm text-slate-600">{alloc.remaining} / {alloc.allocated} remaining</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all"
                  style={{ width: `${(alloc.remaining / alloc.allocated) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
