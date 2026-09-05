'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext.jsx';
import { Menu, Bell, Search, Clock, CheckCircle, X, ChevronRight } from 'lucide-react';
import { getTodayAttendance } from '../../mock/attendance.js';

function generateBreadcrumbs(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Home', href: '/dashboard' }];
  let path = '';
  const labelMap = {
    dashboard: 'Dashboard', employees: 'Employees', contracts: 'Contracts',
    schedules: 'Schedules', attendance: 'Attendance', 'time-off': 'Time Off',
    requests: 'Requests', allocations: 'Allocations', types: 'Leave Types',
    payroll: 'Payroll', payruns: 'Payruns', payslips: 'Payslips',
    structures: 'Salary Structures', rules: 'Salary Rules',
    reports: 'Reports', admin: 'Administration', users: 'Users',
    roles: 'Roles', permissions: 'Permissions', settings: 'Settings',
    new: 'New',
  };
  for (const part of parts) {
    path += `/${part}`;
    crumbs.push({ label: labelMap[part] || part, href: path });
  }
  return crumbs;
}

export default function Header({ onToggleSidebar, onToggleMobileSidebar }) {
  const { user, role, logout } = useAuth();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('');
  const [showCheckInWidget, setShowCheckInWidget] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const breadcrumbs = generateBreadcrumbs(pathname);

  // Simulate live elapsed time
  useEffect(() => {
    if (!checkedIn || !checkInTime) return;
    const interval = setInterval(() => {
      const diff = Date.now() - checkInTime;
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [checkedIn, checkInTime]);

  const handleCheckInOut = async () => {
    setCheckInLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    if (!checkedIn) {
      setCheckedIn(true);
      setCheckInTime(Date.now());
    } else {
      setCheckedIn(false);
      setCheckInTime(null);
      setElapsedTime('');
    }
    setCheckInLoading(false);
  };

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-4 shrink-0 z-10">
      {/* Sidebar toggles */}
      <button onClick={onToggleMobileSidebar} className="text-slate-500 hover:text-slate-900 lg:hidden transition">
        <Menu size={22} />
      </button>
      <button onClick={onToggleSidebar} className="text-slate-500 hover:text-slate-900 hidden lg:block transition">
        <Menu size={22} />
      </button>

      {/* Breadcrumbs */}
      <nav className="flex-1 flex items-center gap-1 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight size={12} className="text-slate-400 shrink-0" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-slate-900 font-medium truncate">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-slate-500 hover:text-slate-900 transition truncate">{crumb.label}</Link>
            )}
          </span>
        ))}
      </nav>

      {/* Check-In Widget (Hidden for Admin) */}
      {role !== 'ADMIN' && (
        <div className="relative">
          <button
            onClick={() => setShowCheckInWidget(!showCheckInWidget)}
            id="checkin-widget-btn"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all
              ${checkedIn
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
          >
            <div className={`w-2 h-2 rounded-full ${checkedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <Clock size={14} />
            {checkedIn ? <span className="hidden sm:inline">{elapsedTime || 'Checked In'}</span> : <span className="hidden sm:inline">Check In</span>}
          </button>

          {showCheckInWidget && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-5 z-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Attendance</h3>
                <button onClick={() => setShowCheckInWidget(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
              </div>

              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${checkedIn ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                {checkedIn
                  ? <CheckCircle size={32} className="text-emerald-600" />
                  : <Clock size={32} className="text-slate-500" />
                }
              </div>

              {checkedIn ? (
                <div className="text-center mb-4">
                  <p className="text-sm text-slate-600">Currently checked in</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{elapsedTime}</p>
                </div>
              ) : (
                <p className="text-center text-sm text-slate-600 mb-4">You are not checked in today.</p>
              )}

              <button
                onClick={handleCheckInOut}
                disabled={checkInLoading}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2
                  ${checkedIn
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  } disabled:opacity-60`}
              >
                {checkInLoading
                  ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : checkedIn ? 'Check Out' : 'Check In'
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notifications Popover */}
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifications(!showNotifications);
            setShowUserMenu(false);
          }}
          className="relative text-slate-500 hover:text-slate-900 transition p-1.5 rounded-lg hover:bg-slate-100"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
        </button>

        {showNotifications && (
          <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
              <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">3 New</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs mt-2">
              <div className="py-2.5">
                <div className="font-medium text-slate-800">September Payrun Validated</div>
                <div className="text-slate-400 mt-0.5">Disbursement scheduled for Sep 30, 2026.</div>
                <div className="text-indigo-600 text-[10px] mt-1 font-medium">10 mins ago</div>
              </div>
              <div className="py-2.5">
                <div className="font-medium text-slate-800">Time Off Approved</div>
                <div className="text-slate-400 mt-0.5">Your Annual Leave request (Sep 14-16) was approved.</div>
                <div className="text-indigo-600 text-[10px] mt-1 font-medium">2 hours ago</div>
              </div>
              <div className="py-2.5">
                <div className="font-medium text-slate-800">Attendance Reminder</div>
                <div className="text-slate-400 mt-0.5">Don't forget to submit missing punches before cutoff.</div>
                <div className="text-indigo-600 text-[10px] mt-1 font-medium">1 day ago</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User avatar & dropdown */}
      <div className="relative">
        <button
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowNotifications(false);
          }}
          className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <span className="text-sm font-medium text-slate-700 hidden md:block">{user?.name?.split(' ')[0]}</span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
            <div className="px-3 py-2 border-b border-slate-100">
              <div className="font-semibold text-slate-900 text-sm truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
            <div className="py-1 space-y-0.5 text-xs">
              <Link
                href="/profile"
                onClick={() => setShowUserMenu(false)}
                className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition font-medium"
              >
                Personal Profile
              </Link>
              {role === 'ADMIN' && (
                <Link
                  href="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="block px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg transition font-medium"
                >
                  System Settings
                </Link>
              )}
            </div>
            <div className="pt-1 border-t border-slate-100">
              <button
                onClick={async () => {
                  await logout();
                  window.location.href = '/login';
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
              >
                Sign Out / Switch Persona
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
