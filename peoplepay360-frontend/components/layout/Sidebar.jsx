'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useSidebar } from '@/context/SidebarContext';
import { canAccessModule, canAccessPath } from '@/lib/rbac';
import {
  Users,
  FileText,
  Clock,
  Calendar,
  CreditCard,
  ChevronDown,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function Sidebar({ mobileOpen: propsMobileOpen, onMobileClose: propsOnMobileClose }) {
  const pathname = usePathname();
  const { role } = useAuthSession();
  const sidebarCtx = useSidebar();

  const mobileOpen = propsMobileOpen !== undefined ? propsMobileOpen : sidebarCtx?.mobileOpen;
  const onMobileClose = propsOnMobileClose || sidebarCtx?.closeMobileSidebar;

  // Collapsible dropdown states - open by default for clear navigation
  const [openMenus, setOpenMenus] = useState({
    timeOff: true,
    payroll: true,
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const timeOffPaths = [
    { path: '/time-off/dashboard', label: 'Dashboard' },
    { path: '/time-off/requests', label: 'Requests' },
    { path: '/time-off/allocations', label: 'Allocations' },
    { path: '/time-off/types', label: 'Time Off Types' },
  ];

  const payrollPaths = [
    { path: '/payroll/dashboard', label: 'Dashboard' },
    { path: '/payroll/payruns', label: 'Payruns' },
    { path: '/payroll/payslips', label: 'Payslips' },
    { path: '/payroll/structures', label: 'Salary Structures' },
    { path: '/payroll/rules', label: 'Salary Rules' },
  ];

  const visibleTimeOffPaths = timeOffPaths.filter((item) => canAccessPath(role, item.path));
  const visiblePayrollPaths = payrollPaths.filter((item) => canAccessPath(role, item.path));

  // Reusable Nav Content
  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 tracking-wide text-base block leading-tight">
              PeoplePay360
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              HR & Payroll
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition-all cursor-pointer"
          aria-label="Close Sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar">
        {/* Employees Module */}
        {canAccessPath(role, '/employees') && (
          <Link
            href="/employees"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/employees')
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4.5 h-4.5 shrink-0" />
            <span>Employees</span>
          </Link>
        )}

        {/* Contracts Module */}
        {canAccessPath(role, '/contracts') && (
          <Link
            href="/contracts"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/contracts')
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4.5 h-4.5 shrink-0" />
            <span>Contracts</span>
          </Link>
        )}

        {/* Attendance Module */}
        {canAccessPath(role, '/attendance') && (
          <Link
            href="/attendance"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isActive('/attendance')
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4.5 h-4.5 shrink-0" />
            <span>Attendance</span>
          </Link>
        )}

        {/* Time Off Module */}
        {visibleTimeOffPaths.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu('timeOff')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4.5 h-4.5 shrink-0" />
                <span>Time Off</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openMenus.timeOff ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {openMenus.timeOff && (
              <div className="pl-6 pr-1 space-y-1 py-1 border-l-2 border-slate-200 ml-5">
                {visibleTimeOffPaths.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pathname === item.path
                        ? 'text-indigo-600 bg-indigo-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pathname === item.path ? 'bg-indigo-600' : 'bg-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payroll Module */}
        {visiblePayrollPaths.length > 0 && (
          <div className="space-y-1">
            <button
              onClick={() => toggleMenu('payroll')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4.5 h-4.5 shrink-0" />
                <span>Payroll</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  openMenus.payroll ? 'rotate-180 text-indigo-600' : ''
                }`}
              />
            </button>

            {openMenus.payroll && (
              <div className="pl-6 pr-1 space-y-1 py-1 border-l-2 border-slate-200 ml-5">
                {visiblePayrollPaths.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={handleNavClick}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      pathname === item.path
                        ? 'text-indigo-600 bg-indigo-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        pathname === item.path ? 'bg-indigo-600' : 'bg-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between shrink-0">
        <span>System Active</span>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR: Always fixed on left side for screen width >= 1024px */}
      <aside className="hidden lg:flex w-64 h-screen fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 shrink-0 z-30 shadow-sm">
        {navContent}
      </aside>

      {/* MOBILE DRAWER: Overlay drawer when mobileOpen is true on screen width < 1024px */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            onClick={onMobileClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />
          <aside className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl z-50 animate-fade-in">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
