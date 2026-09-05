'use client';

import { useState } from 'react';
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from '../../../../src/lib/permissions.js';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import { Shield, Check, Lock, ChevronRight, UserCheck } from 'lucide-react';

export default function AdminRolesPage() {
  const [selectedRole, setSelectedRole] = useState(ROLES.HR_PAYROLL_MANAGER);

  const roleDescriptions = {
    [ROLES.ADMIN]: 'Unrestricted system-wide control, security governance, user lifecycle management, and audit logs.',
    [ROLES.HR_MANAGER]: 'Full control over employee profiles, employment contracts, time-off approvals, and working schedules.',
    [ROLES.HR_PAYROLL_USER]: 'Drafts payruns, validates salary rule evaluations, and manages payslip computations.',
    [ROLES.HR_PAYROLL_MANAGER]: 'Approves and authorizes payruns, executes final payroll payouts, and manages salary structures.',
    [ROLES.EMPLOYEE]: 'Self-service portal for clocking attendance, submitting time-off requests, and viewing personal payslips.',
  };

  const currentPermissions = ROLE_PERMISSIONS[selectedRole] || [];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Roles & Access Hierarchy</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise Role-Based Access Control (RBAC) definitions and granted operational capabilities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Selection Column */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Enterprise Roles</h2>
            {Object.entries(ROLES).map(([key, roleKey]) => {
              const isSelected = selectedRole === roleKey;
              const permCount = (ROLE_PERMISSIONS[roleKey] || []).length;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedRole(roleKey)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-600'}`}>
                      <Shield size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{ROLE_LABELS[roleKey]}</div>
                      <div className={`text-xs ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {permCount} permissions granted
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                </button>
              );
            })}
          </div>

          {/* Role Details & Permissions Inspector */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between pb-5 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 uppercase tracking-wider">
                  Role Inspector
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">{ROLE_LABELS[selectedRole]}</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-xl">
                  {roleDescriptions[selectedRole]}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-indigo-600">{currentPermissions.length}</span>
                <div className="text-xs text-slate-400">Total Capabilities</div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Granted Capabilities</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
                {currentPermissions.map((perm) => (
                  <div
                    key={perm}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-mono"
                  >
                    <Check size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{perm}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
