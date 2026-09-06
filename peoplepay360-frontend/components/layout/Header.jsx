'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAttendanceWidget } from '@/hooks/useAttendanceWidget';
import { useSidebar } from '@/context/SidebarContext';
import { ROLE_LABELS, canAccessPath } from '@/lib/rbac';
import { getInitials } from '@/lib/formatters';
import {
  LogIn,
  LogOut,
  Search,
  ShieldCheck,
  Loader2,
  Menu,
  Users,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';

export default function Header({ onMobileToggle: propsOnMobileToggle }) {
  const router = useRouter();
  const { user, role, signOut } = useAuthSession();
  const { isCheckedIn, elapsedFormatted, loading: attendanceLoading, toggleAttendance } = useAttendanceWidget();
  const sidebarCtx = useSidebar();

  const onMobileToggle = propsOnMobileToggle || sidebarCtx?.toggleMobileSidebar;

  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close search popover & user dropdown on outside click or ESC key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSearchFocused(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Quick Search Dropdown Items (filtered by role permissions)
  const searchOptions = [
    { id: 'emp', title: 'Employees Directory', desc: 'Manage staff, departments & user roles', path: '/employees', icon: Users, color: 'text-indigo-600 bg-indigo-50' },
    { id: 'ctr', title: 'Employment Contracts', desc: 'View active contracts & pay structures', path: '/contracts', icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { id: 'att', title: 'Attendance Logs', desc: 'Track work sessions, hours & overtime', path: '/attendance', icon: Clock, color: 'text-emerald-600 bg-emerald-50' },
    { id: 'tmo', title: 'Time Off & Leaves', desc: 'Manage leave requests & balances', path: '/time-off/requests', icon: Calendar, color: 'text-amber-600 bg-amber-50' },
    { id: 'pay', title: 'Payroll Payruns', desc: 'Compute payslips & salary rules', path: '/payroll/payruns', icon: CreditCard, color: 'text-violet-600 bg-violet-50' },
  ];

  const filteredSearchOptions = searchOptions.filter(
    (opt) =>
      canAccessPath(role, opt.path) &&
      (!searchQuery ||
        opt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opt.desc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectOption = (path) => {
    setSearchQuery('');
    setSearchFocused(false);
    router.push(path);
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-0 lg:left-64 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-30 shadow-xs">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle */}
        <button
          onClick={onMobileToggle}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-all"
          aria-label="Open Mobile Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Executive Search Input with Dropdown Popover */}
        <div ref={searchContainerRef} className="relative hidden sm:block w-64 md:w-80 lg:w-96">
          <div
            className={`flex items-center gap-2.5 px-3.5 py-2 bg-slate-50 border-2 rounded-2xl transition-all ${
              searchFocused
                ? 'border-indigo-600 bg-white ring-4 ring-indigo-500/15 shadow-sm'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <Search className="w-4 h-4 text-indigo-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search employees, records..."
              className="w-full bg-transparent text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="p-0.5 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-300 rounded-md shadow-2xs shrink-0">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Professional Live Search Options Dropdown Popover */}
          {searchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <span>Quick Search Results</span>
                <span>{filteredSearchOptions.length} found</span>
              </div>

              <div className="max-h-72 overflow-y-auto py-1 custom-scrollbar">
                {filteredSearchOptions.length > 0 ? (
                  filteredSearchOptions.map((opt) => {
                    const IconComponent = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt.path)}
                        className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${opt.color}`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                              {opt.title}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500 font-medium">
                    No matching records found for "{searchQuery}"
                  </div>
                )}
              </div>

              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                <span>Select an item to navigate</span>
                <span>Press ESC to dismiss</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Quick Attendance Check-In / Check-Out Dynamic Button */}
        {mounted && isCheckedIn ? (
          /* ACTIVE SESSION: CHECK OUT BUTTON WITH LIVE TIMER */
          <button
            onClick={toggleAttendance}
            disabled={attendanceLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            title="Active Attendance Session — Click to Check Out"
          >
            {attendanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-none">
                  Check Out <span className="hidden sm:inline">({elapsedFormatted})</span>
                </span>
              </>
            )}
          </button>
        ) : (
          /* NO ACTIVE SESSION: CHECK IN BUTTON */
          <button
            onClick={toggleAttendance}
            disabled={!mounted || attendanceLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            title="Start Work Session — Click to Check In"
          >
            {attendanceLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Check In</span>
              </>
            )}
          </button>
        )}

        {/* Role Badge */}
        {mounted && role && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{ROLE_LABELS[role] || (role ? role.replace(/_/g, ' ') : 'User')}</span>
          </div>
        )}

        {/* User Menu Dropdown */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-2 sm:gap-2.5 p-1 sm:pr-2.5 rounded-2xl border transition-all cursor-pointer select-none ${
              dropdownOpen
                ? 'bg-slate-100/90 border-slate-300 shadow-inner'
                : 'hover:bg-slate-100 border-transparent hover:border-slate-200'
            }`}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {mounted ? getInitials(user?.name || user?.email || 'User') : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {mounted ? (user?.name || (user?.email ? user.email.split('@')[0] : 'User')) : 'User'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium leading-tight">
                {mounted && role ? (ROLE_LABELS[role] || (role ? role.replace(/_/g, ' ') : 'User')) : ''}
              </p>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180 text-indigo-600' : ''
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
              {/* Profile Card Header */}
              <div className="p-4 bg-gradient-to-b from-slate-50/80 to-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    {mounted ? getInitials(user?.name || user?.email || 'User') : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {mounted ? (user?.name || (user?.email ? user.email.split('@')[0] : 'User')) : 'User'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                      {mounted && user?.email ? user.email : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 text-[11px] font-semibold w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{mounted && role ? (ROLE_LABELS[role] || (role ? role.replace(/_/g, ' ') : 'User')) : 'User'}</span>
                </div>
              </div>

              {/* Sign Out Action */}
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    signOut();
                  }}
                  className="w-full px-3 py-2.5 text-left text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center justify-between transition-all group cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <LogOut className="w-4 h-4 text-red-500 group-hover:translate-x-0.5 transition-transform" />
                    <span>Sign out</span>
                  </span>
                  <kbd className="text-[10px] font-mono text-red-400 group-hover:text-red-500">Exit</kbd>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

