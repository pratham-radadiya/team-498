'use client';

import Link from 'next/link';
import KPICard from '../common/KPICard.jsx';
import { Users, DollarSign, Shield, Settings, FileText, UserCheck } from 'lucide-react';
import { mockUsers } from '../../mock/users.js';
import { ROLE_LABELS } from '../../lib/permissions.js';
import { mockDashboardKPIs } from '../../mock/dashboard.js';

const formatINR = (v) => `₹${(v / 100000).toFixed(1)}L`;

export default function AdminDashboard() {
  const kpis = mockDashboardKPIs;
  const roleCounts = mockUsers.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  const adminLinks = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, desc: `${mockUsers.length} accounts` },
    { label: 'Roles & Permissions', href: '/admin/roles', icon: Shield, desc: '5 system roles' },
    { label: 'System Settings', href: '/admin/settings', icon: Settings, desc: 'Configuration' },
    { label: 'View Reports', href: '/reports', icon: FileText, desc: 'All reports' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Complete system overview and administration</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full">Admin Access</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Users" value={mockUsers.length} icon={Users} color="indigo" />
        <KPICard label="Total Employees" value={90} icon={UserCheck} color="emerald" />
        <KPICard label="Net Payroll (Aug)" value={formatINR(kpis.totalNetSalaryPaid.value)} icon={DollarSign} color="violet" />
        <KPICard label="Payslips Generated" value={kpis.payslipsGenerated.value} icon={FileText} color="amber" />
      </div>

      {/* Admin Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-300 hover:shadow-md transition group">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition">
              <link.icon size={20} className="text-indigo-600 group-hover:text-white transition" />
            </div>
            <p className="font-semibold text-slate-800 text-sm group-hover:text-indigo-700 transition">{link.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>

      {/* Role Distribution */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">Role Distribution</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(roleCounts).map(([role, count]) => (
            <div key={role} className="text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-2xl font-bold text-indigo-600">{count}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{ROLE_LABELS[role]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* System Alerts */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Database', status: 'Healthy', icon: '🟢' },
            { label: 'Authentication', status: 'Active', icon: '🟢' },
            { label: 'Payroll Engine', status: 'Ready', icon: '🟢' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{s.label}</p>
                <p className="text-xs text-emerald-700">{s.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
