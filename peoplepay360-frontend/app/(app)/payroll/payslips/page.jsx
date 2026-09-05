'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../../src/components/common/DataTable.jsx';
import StatusBadge from '../../../../src/components/common/StatusBadge.jsx';
import SearchBar from '../../../../src/components/common/SearchBar.jsx';
import { getPayslipsApi } from '../../../../src/api/payrollApi.js';
import { mockPayruns } from '../../../../src/mock/payroll.js';
import { FileText } from 'lucide-react';
import { useAuth } from '../../../../src/context/AuthContext.jsx';
import { ROLES } from '../../../../src/lib/permissions.js';

const formatINR = (v) => `₹${v?.toLocaleString('en-IN') || 0}`;

export default function PayslipsPage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payrunFilter, setPayrunFilter] = useState('');
  const isSelfOnly = role === ROLES.EMPLOYEE;

  useEffect(() => {
    getPayslipsApi({ employeeId: isSelfOnly ? user?.employeeId : (employeeFilter || undefined) }).then((res) => {
      let data = res.data;
      if (payrunFilter) data = data.filter((p) => p.payrunId === payrunFilter);
      if (search) data = data.filter((p) => p.employeeName.toLowerCase().includes(search.toLowerCase()));
      setPayslips(data);
      setLoading(false);
    });
  }, [search, payrunFilter, isSelfOnly, user?.employeeId, employeeFilter]);

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800">{v}</p>
        <p className="text-xs text-slate-400">{row.department}</p>
      </div>
    )},
    { key: 'payrunName', label: 'Payrun' },
    { key: 'periodStart', label: 'Period', render: (v, row) => `${row.periodStart} → ${row.periodEnd}` },
    { key: 'workedDays', label: 'Worked Days', render: (v) => `${v}d` },
    { key: 'grossSalary', label: 'Gross', render: (v) => <span className="text-slate-700">{formatINR(v)}</span> },
    { key: 'totalDeductions', label: 'Deductions', render: (v) => <span className="text-red-500">-{formatINR(v)}</span> },
    { key: 'netSalary', label: 'Net', render: (v) => <span className="font-bold text-emerald-700">{formatINR(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" showDot /> },
    { key: 'id', label: '', render: (v) => (
      <Link href={`/payroll/payslips/${v}`} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium" onClick={(e) => e.stopPropagation()}>
        <FileText size={12} /> View
      </Link>
    )},
  ];

  return (
    <div className="space-y-5">
      <PageHeader title={isSelfOnly ? 'My Payslips' : 'Payslips'} subtitle={`${payslips.length} payslips`} />

      <div className="flex flex-wrap items-center gap-3">
        {!isSelfOnly && <SearchBar placeholder="Search by employee..." onSearch={setSearch} className="flex-1 min-w-48" />}
        {!isSelfOnly && (
          <select value={payrunFilter} onChange={(e) => setPayrunFilter(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Payruns</option>
            {mockPayruns.map((pr) => <option key={pr.id} value={pr.id}>{pr.name}</option>)}
          </select>
        )}
      </div>

      <DataTable
        columns={columns}
        data={payslips}
        loading={loading}
        emptyMessage="No payslips found."
        onRowClick={(row) => router.push(`/payroll/payslips/${row.id}`)}
        total={payslips.length}
      />
    </div>
  );
}
