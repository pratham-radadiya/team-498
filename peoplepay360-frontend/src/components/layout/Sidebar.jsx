'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { NAV_ITEMS, ROLE_LABELS, ROLE_COLORS } from '../../lib/permissions.js';
import {
  LayoutDashboard, Users, FileText, Calendar, Clock, Umbrella,
  DollarSign, BarChart3, Settings, ChevronDown, ChevronRight,
  LogOut, X, Menu
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard, Users, FileText, Calendar, Clock, Umbrella,
  DollarSign, BarChart3, Settings,
};

const ROLE_BADGE_COLORS = {
  EMPLOYEE: 'bg-blue-500/20 text-blue-300',
  HR_MANAGER: 'bg-green-500/20 text-green-300',
  HR_PAYROLL_USER: 'bg-purple-500/20 text-purple-300',
  HR_PAYROLL_MANAGER: 'bg-orange-500/20 text-orange-300',
  ADMIN: 'bg-red-500/20 text-red-300',
};

export default function Sidebar({ isOpen, isMobileOpen, onMobileClose }) {
  const { user, role, logout, can, canAny } = useAuth();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState(['timeoff', 'payroll']);

  const toggleMenu = (id) => {
    setExpandedMenus((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const isNavItemVisible = (item) => {
    if (item.roles) return item.roles.includes(role);
    if (!item.permissions) return true;
    if (item.anyPermission) return canAny(item.permissions);
    return item.permissions.every((p) => can(p));
  };

  const isChildVisible = (child) => {
    if (!child.permissions) return true;
    return child.permissions.some((p) => can(p));
  };

  const isActive = (href) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  const sidebarClasses = `
    fixed lg:relative z-30 inset-y-0 left-0
    flex flex-col h-full bg-slate-900 border-r border-slate-800
    transition-all duration-300 ease-in-out
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    ${isOpen ? 'w-64' : 'w-20 lg:flex hidden'}
  `;

  return (
    <aside className={sidebarClasses}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800 shrink-0">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
          <Users size={18} className="text-white" />
        </div>
        {isOpen && (
          <div className="min-w-0">
            <div className="text-white font-bold text-sm leading-tight">PeoplePay360</div>
            <div className="text-indigo-400 text-xs font-medium">HR & Payroll</div>
          </div>
        )}
        {isMobileOpen && (
          <button onClick={onMobileClose} className="ml-auto text-slate-400 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          if (!isNavItemVisible(item)) return null;
          const Icon = ICON_MAP[item.icon];
          const hasChildren = item.children?.filter(isChildVisible).length > 0;
          const isExpanded = expandedMenus.includes(item.id);
          const itemActive = isActive(item.href);

          if (hasChildren) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-left
                    ${itemActive || item.children?.some((c) => isActive(c.href))
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  {isOpen && (
                    <>
                      <span className="text-sm font-medium flex-1">{item.label}</span>
                      {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </>
                  )}
                </button>
                {isOpen && isExpanded && (
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                    {item.children.filter(isChildVisible).map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all
                          ${isActive(child.href)
                            ? 'bg-indigo-600 text-white font-medium'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
                ${itemActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              title={!isOpen ? item.label : undefined}
            >
              {Icon && <Icon size={18} className="shrink-0" />}
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="px-3 py-4 border-t border-slate-800 shrink-0">
        {isOpen ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white text-sm font-medium truncate">{user?.name}</div>
              <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ${ROLE_BADGE_COLORS[role] || 'bg-slate-700 text-slate-400'}`}>
                {ROLE_LABELS[role]}
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition shrink-0" title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2 text-slate-500 hover:text-red-400 transition"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
        )}
      </div>
    </aside>
  );
}
