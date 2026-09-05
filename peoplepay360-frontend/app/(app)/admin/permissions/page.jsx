'use client';

import { useState } from 'react';
import { PERMISSIONS, ROLES, ROLE_LABELS, ROLE_PERMISSIONS } from '../../../../src/lib/permissions.js';
import RoleGuard from '../../../../src/components/common/RoleGuard.jsx';
import SearchBar from '../../../../src/components/common/SearchBar.jsx';
import { Key, CheckCircle, XCircle } from 'lucide-react';

export default function AdminPermissionsPage() {
  const [search, setSearch] = useState('');

  // Group permissions by category
  const permissionCategories = [
    {
      category: 'Employees',
      items: [
        { key: PERMISSIONS.EMPLOYEES_READ, desc: 'View employee directory and detailed profiles' },
        { key: PERMISSIONS.EMPLOYEES_CREATE, desc: 'Onboard and create new employee records' },
        { key: PERMISSIONS.EMPLOYEES_UPDATE, desc: 'Edit existing employee records and information' },
        { key: PERMISSIONS.EMPLOYEES_DELETE, desc: 'Archive or remove employee records' },
        { key: PERMISSIONS.EMPLOYEES_READ_SELF, desc: 'View own employee profile only' },
      ],
    },
    {
      category: 'Contracts & Working Schedules',
      items: [
        { key: PERMISSIONS.CONTRACTS_READ, desc: 'Access employment contract details and wages' },
        { key: PERMISSIONS.CONTRACTS_CREATE, desc: 'Draft new employment contracts' },
        { key: PERMISSIONS.CONTRACTS_UPDATE, desc: 'Update contract status, salary, and terms' },
        { key: PERMISSIONS.CONTRACTS_DELETE, desc: 'Delete draft contracts' },
        { key: PERMISSIONS.SCHEDULES_READ, desc: 'View working schedules and shift definitions' },
        { key: PERMISSIONS.SCHEDULES_CREATE, desc: 'Create new shift patterns and working hours' },
        { key: PERMISSIONS.SCHEDULES_UPDATE, desc: 'Modify schedule definitions' },
        { key: PERMISSIONS.SCHEDULES_DELETE, desc: 'Delete inactive schedule templates' },
      ],
    },
    {
      category: 'Attendance & Time Off',
      items: [
        { key: PERMISSIONS.ATTENDANCE_READ, desc: 'View company-wide attendance and check-in logs' },
        { key: PERMISSIONS.ATTENDANCE_CREATE, desc: 'Record check-in/out timestamps' },
        { key: PERMISSIONS.ATTENDANCE_UPDATE, desc: 'Modify attendance entries' },
        { key: PERMISSIONS.ATTENDANCE_CORRECT, desc: 'Perform manual attendance corrections' },
        { key: PERMISSIONS.ATTENDANCE_READ_SELF, desc: 'View own attendance history only' },
        { key: PERMISSIONS.TIMEOFF_READ, desc: 'View team leave requests and time-off calendar' },
        { key: PERMISSIONS.TIMEOFF_CREATE, desc: 'Submit time-off requests' },
        { key: PERMISSIONS.TIMEOFF_APPROVE, desc: 'Approve or refuse employee leave requests' },
        { key: PERMISSIONS.TIMEOFF_TYPES_MANAGE, desc: 'Configure leave types and accrual policies' },
        { key: PERMISSIONS.ALLOCATIONS_MANAGE, desc: 'Allocate annual leave balances to staff' },
        { key: PERMISSIONS.TIMEOFF_READ_SELF, desc: 'View own leave balances and requests only' },
      ],
    },
    {
      category: 'Payroll & Compensation',
      items: [
        { key: PERMISSIONS.PAYRUNS_CREATE, desc: 'Create monthly and ad-hoc payrun batches' },
        { key: PERMISSIONS.PAYRUNS_READ, desc: 'Access payrun details and batch summary' },
        { key: PERMISSIONS.PAYRUNS_UPDATE, desc: 'Update payrun states and details' },
        { key: PERMISSIONS.PAYRUN_COMPUTE, desc: 'Trigger automatic salary rule evaluations' },
        { key: PERMISSIONS.PAYRUN_VALIDATE, desc: 'Validate computed payruns' },
        { key: PERMISSIONS.PAYRUN_MARK_PAID, desc: 'Mark payruns as paid and trigger bank disbursements' },
        { key: PERMISSIONS.PAYRUN_SEND_PAYSLIPS, desc: 'Dispatch payslips to employees via portal/email' },
        { key: PERMISSIONS.PAYSLIPS_CREATE, desc: 'Generate individual salary payslips' },
        { key: PERMISSIONS.PAYSLIPS_READ, desc: 'View company-wide payslips' },
        { key: PERMISSIONS.PAYSLIPS_UPDATE, desc: 'Adjust individual payslip line items' },
        { key: PERMISSIONS.PAYSLIPS_READ_SELF, desc: 'Download and view own monthly payslips only' },
        { key: PERMISSIONS.SALARY_STRUCTURES_READ, desc: 'View salary structure templates' },
        { key: PERMISSIONS.SALARY_STRUCTURES_MANAGE, desc: 'Create and configure salary structures' },
        { key: PERMISSIONS.SALARY_RULES_READ, desc: 'View salary calculation rules' },
        { key: PERMISSIONS.SALARY_RULES_MANAGE, desc: 'Manage rule equations and deduction formulas' },
      ],
    },
    {
      category: 'Administration & Analytics',
      items: [
        { key: PERMISSIONS.USERS_MANAGE, desc: 'Administer user accounts and security' },
        { key: PERMISSIONS.REPORTS_READ, desc: 'Access analytics and payroll summary reports' },
        { key: PERMISSIONS.HR_DASHBOARD, desc: 'Access HR executive dashboard' },
        { key: PERMISSIONS.PAYROLL_DASHBOARD, desc: 'Access Payroll specialist dashboard' },
      ],
    },
  ];

  return (
    <RoleGuard allowedRoles={['ADMIN']}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Permissions Matrix</h1>
            <p className="text-sm text-slate-500 mt-1">
              Global system capability register and granted access matrix across all 5 roles.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <SearchBar value={search} onChange={setSearch} placeholder="Filter permissions..." />
          </div>
        </div>

        <div className="space-y-6">
          {permissionCategories.map((group) => {
            const filteredItems = group.items.filter(
              (p) =>
                p.key?.toLowerCase().includes(search.toLowerCase()) ||
                p.desc?.toLowerCase().includes(search.toLowerCase())
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={group.category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50/75 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-800 text-sm">{group.category}</h2>
                  <span className="text-xs text-slate-400 font-medium">{filteredItems.length} Capabilities</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400">
                        <th className="py-2.5 px-4 font-semibold">Capability</th>
                        <th className="py-2.5 px-4 font-semibold">Description</th>
                        {Object.values(ROLES).map((role) => (
                          <th key={role} className="py-2.5 px-3 font-semibold text-center whitespace-nowrap">
                            {ROLE_LABELS[role]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredItems.map((item) => (
                        <tr key={item.key} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">{item.key}</td>
                          <td className="py-3 px-4 text-slate-500">{item.desc}</td>
                          {Object.values(ROLES).map((role) => {
                            const isAllowed = (ROLE_PERMISSIONS[role] || []).includes(item.key);
                            return (
                              <td key={role} className="py-3 px-3 text-center">
                                {isAllowed ? (
                                  <CheckCircle size={16} className="text-emerald-500 mx-auto" />
                                ) : (
                                  <XCircle size={16} className="text-slate-200 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </RoleGuard>
  );
}
