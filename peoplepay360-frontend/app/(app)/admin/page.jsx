'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../src/context/AuthContext.jsx';
import RoleGuard from '../../../src/components/common/RoleGuard.jsx';
import KPICard from '../../../src/components/common/KPICard.jsx';
import { userApi } from '../../../src/api/userApi.js';
import {
  Users, Shield, Key, Settings, Activity,
  Lock, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [userCount, setUserCount] = useState(6);
  const [activeUsers, setActiveUsers] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userApi.getUsers().then((res) => {
      setUserCount(res.data.length);
      setActiveUsers(res.data.filter((u) => u.status === 'Active').length);
      setLoading(false);
    });
  }, []);

  const adminModules = [
    {
      title: 'User Management',
      desc: 'Provision user accounts, assign enterprise roles, and control access status.',
      icon: Users,
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
      href: '/admin/users',
      stat: `${userCount} Users`,
    },
    {
      title: 'Roles & Hierarchy',
      desc: 'Inspect role permissions, hierarchy levels, and access boundaries.',
      icon: Shield,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      href: '/admin/roles',
      stat: '5 Roles',
    },
    {
      title: 'Permission Matrix',
      desc: 'Granular capability mapping covering HR, Payroll, and Self-service actions.',
      icon: Key,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      href: '/admin/permissions',
      stat: '32 Capabilities',
    },
    {
      title: 'System Settings',
      desc: 'Configure organization profile, payroll cycles, tax codes, and currency defaults.',
      icon: Settings,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      href: '/admin/settings',
      stat: 'Enterprise Config',
    },
  ];

  const auditLogs = [
    { id: 'LOG001', action: 'User Logged In', user: 'admin@peoplepay360.com', ip: '192.168.1.102', time: 'Just now', status: 'success' },
    { id: 'LOG002', action: 'Payrun Validated', user: 'vikram.singh@peoplepay360.com', ip: '192.168.1.45', time: '12 mins ago', status: 'success' },
    { id: 'LOG003', action: 'Leave Approved', user: 'kavya.reddy@peoplepay360.com', ip: '192.168.1.88', time: '45 mins ago', status: 'success' },
    { id: 'LOG004', action: 'Contract Updated', user: 'kavya.reddy@peoplepay360.com', ip: '192.168.1.88', time: '2 hours ago', status: 'success' },
    { id: 'LOG005', action: 'Failed Login Attempt', user: 'unknown@external.net', ip: '203.0.113.19', time: '4 hours ago', status: 'warning' },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']} fallback={
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <Lock className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-slate-500 text-sm mt-1">This module is reserved for System Administrators.</p>
      </div>
    }>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user accounts, RBAC permissions, audit trail, and global system settings.
          </p>
        </div>

        {/* System KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Users"
            value={userCount}
            subtitle={`${activeUsers} active accounts`}
            icon={Users}
            color="indigo"
          />
          <KPICard
            title="System Roles"
            value="5"
            subtitle="Standard RBAC matrix"
            icon={Shield}
            color="emerald"
          />
          <KPICard
            title="Security Status"
            value="Optimal"
            subtitle="All policies enforced"
            icon={CheckCircle2}
            color="sky"
          />
          <KPICard
            title="System Version"
            value="v2.4.0"
            subtitle="Turbopack Engine"
            icon={Activity}
            color="amber"
          />
        </div>

        {/* Admin Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.title}
                href={mod.href}
                className="group p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${mod.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      {mod.stat}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">{mod.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  Configure <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Security & Audit Log */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">System Audit Trail</h2>
              <p className="text-xs text-slate-500">Live stream of critical administrative & operational actions</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Logging
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${log.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {log.status === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  </div>
                  <div>
                    <span className="font-medium text-slate-800">{log.action}</span>
                    <span className="text-slate-400 text-xs ml-2">by {log.user}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>IP: {log.ip}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
