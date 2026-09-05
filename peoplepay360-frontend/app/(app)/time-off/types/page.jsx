'use client';

import { useState, useEffect } from 'react';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { PermissionGuard } from '../../../../src/components/common/Guards.jsx';
import { mockTimeOffTypes } from '../../../../src/mock/timeOff.js';
import { PERMISSIONS } from '../../../../src/lib/permissions.js';
import { Plus, Settings } from 'lucide-react';

export default function TimeOffTypesPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => { setTypes(mockTimeOffTypes); setLoading(false); }, 300);
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Types"
        subtitle="Configure leave policies and approval workflows"
        actions={
          <PermissionGuard permission={PERMISSIONS.TIMEOFF_TYPES_MANAGE}>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Leave Type
            </button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {types.map((type) => (
          <div key={type.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                <h3 className="font-semibold text-slate-900">{type.name}</h3>
              </div>
              <StatusBadge status={type.active ? 'Active' : 'Inactive'} size="xs" />
            </div>

            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{type.description}</p>

            <div className="space-y-2">
              {[
                { label: 'Unit', value: type.unit },
                { label: 'Requires Allocation', value: type.requiresAllocation ? 'Yes' : 'No' },
                { label: 'Approval Workflow', value: type.approvalWorkflow },
                { label: 'Payroll Integration', value: type.payrollIntegration },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-700">{item.value}</span>
                </div>
              ))}
            </div>

            <PermissionGuard permission={PERMISSIONS.TIMEOFF_TYPES_MANAGE}>
              <button className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition">
                <Settings size={12} /> Configure
              </button>
            </PermissionGuard>
          </div>
        ))}
      </div>
    </div>
  );
}
