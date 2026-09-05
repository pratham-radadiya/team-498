'use client';

const STATUS_STYLES = {
  // Employee statuses
  Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
  'On Leave': 'bg-amber-100 text-amber-800 border-amber-200',
  // Contract statuses
  Running: 'bg-blue-100 text-blue-800 border-blue-200',
  Expired: 'bg-red-100 text-red-800 border-red-200',
  Upcoming: 'bg-purple-100 text-purple-800 border-purple-200',
  // Attendance statuses
  Present: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Late: 'bg-amber-100 text-amber-800 border-amber-200',
  Absent: 'bg-red-100 text-red-800 border-red-200',
  Overtime: 'bg-blue-100 text-blue-800 border-blue-200',
  'Missing Check-out': 'bg-orange-100 text-orange-800 border-orange-200',
  'Manually Edited': 'bg-purple-100 text-purple-800 border-purple-200',
  // Time off statuses
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Refused: 'bg-red-100 text-red-800 border-red-200',
  Cancelled: 'bg-slate-100 text-slate-700 border-slate-200',
  // Payrun statuses
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Computed: 'bg-blue-100 text-blue-800 border-blue-200',
  Validated: 'bg-purple-100 text-purple-800 border-purple-200',
  Paid: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  // General
  success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-blue-100 text-blue-800 border-blue-200',
};

const DOT_COLORS = {
  Active: 'bg-emerald-500', Present: 'bg-emerald-500', Approved: 'bg-emerald-500', Paid: 'bg-emerald-500', success: 'bg-emerald-500',
  Inactive: 'bg-slate-400', Cancelled: 'bg-slate-400', Draft: 'bg-slate-400',
  'On Leave': 'bg-amber-500', Late: 'bg-amber-500', Pending: 'bg-amber-500', warning: 'bg-amber-500',
  Absent: 'bg-red-500', Refused: 'bg-red-500', Expired: 'bg-red-500', error: 'bg-red-500', critical: 'bg-red-500',
  Running: 'bg-blue-500', Overtime: 'bg-blue-500', Computed: 'bg-blue-500', info: 'bg-blue-500',
  Upcoming: 'bg-purple-500', Validated: 'bg-purple-500',
  'Missing Check-out': 'bg-orange-500',
  'Manually Edited': 'bg-purple-500',
};

export default function StatusBadge({ status, showDot = false, size = 'sm' }) {
  const sizeClasses = size === 'xs' ? 'text-xs px-2 py-0.5' : size === 'lg' ? 'text-sm px-3 py-1' : 'text-xs px-2.5 py-1';
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  const dot = DOT_COLORS[status] || 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap ${sizeClasses} ${style}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {status}
    </span>
  );
}
