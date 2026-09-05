'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../../src/components/common/DataTable.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import { mockAllocations } from '../../../../src/mock/timeOff.js';
import { useAuth } from '../../../../src/context/AuthContext.jsx';
import { ROLES } from '../../../../src/lib/permissions.js';

export default function AllocationsPage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSelfOnly = role === ROLES.EMPLOYEE;

  useEffect(() => {
    setTimeout(() => {
      let res = [...mockAllocations];
      if (isSelfOnly) res = res.filter((a) => a.employeeId === user?.employeeId);
      setAllocations(res);
      setLoading(false);
    }, 350);
  }, [isSelfOnly, user?.employeeId]);

  const columns = [
    { key: 'employeeName', label: 'Employee' },
    { key: 'timeOffTypeName', label: 'Leave Type' },
    { key: 'allocated', label: 'Allocated', render: (v) => <span className="font-semibold text-slate-900">{v}</span> },
    { key: 'taken', label: 'Taken', render: (v) => <span className="text-amber-600 font-medium">{v}</span> },
    { key: 'remaining', label: 'Remaining', render: (v, row) => (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-16">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(v / row.allocated) * 100}%` }} />
        </div>
        <span className="text-indigo-700 font-semibold text-sm">{v}</span>
      </div>
    )},
    { key: 'validity', label: 'Validity' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" showDot /> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Leave Allocations" subtitle={`${allocations.length} allocations`} />
      <DataTable columns={columns} data={allocations} loading={loading} emptyMessage="No allocations found." onRowClick={(row) => {}} total={allocations.length} />
    </div>
  );
}
