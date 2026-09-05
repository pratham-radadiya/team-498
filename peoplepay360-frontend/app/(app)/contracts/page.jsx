'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../src/components/common/DataTable.jsx';
import StatusBadge from '../../../src/components/common/StatusBadge.jsx';
import SearchBar from '../../../src/components/common/SearchBar.jsx';
import { PermissionGuard } from '../../../src/components/common/Guards.jsx';
import { PERMISSIONS } from '../../../src/lib/permissions.js';
import { mockContracts } from '../../../src/mock/contracts.js';
import { Plus, FileText } from 'lucide-react';

const formatINR = (v) => `₹${v?.toLocaleString('en-IN') || 0}`;

export default function ContractsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeFilter = searchParams.get('employee');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      let results = [...mockContracts];
      if (employeeFilter) results = results.filter((c) => c.employeeId === employeeFilter);
      if (search) results = results.filter((c) => c.employeeName.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));
      if (status) results = results.filter((c) => c.status === status);
      setContracts(results);
      setLoading(false);
    }, 400);
  }, [search, status, employeeFilter]);

  const columns = [
    { key: 'id', label: 'Contract Ref', render: (v) => <span className="font-mono text-xs text-indigo-600">{v}</span> },
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800">{v}</p>
        <p className="text-xs text-slate-400">{row.employeeId}</p>
      </div>
    )},
    { key: 'jobPosition', label: 'Position' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date', render: (v) => v || <span className="text-slate-400">—</span> },
    { key: 'wage', label: 'Wage / Month', render: (v) => <span className="font-semibold text-slate-900">{formatINR(v)}</span> },
    { key: 'salaryStructureName', label: 'Structure' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" showDot /> },
  ];

  return (
    <div className="space-y-5">
      {employeeFilter && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm text-indigo-700 flex items-center gap-2">
          <FileText size={14} />
          Showing contracts for employee: <strong>{employeeFilter}</strong>
          <Link href="/contracts" className="ml-auto underline text-xs">Show all</Link>
        </div>
      )}
      <PageHeader
        title="Contracts"
        subtitle={`${contracts.length} contract${contracts.length !== 1 ? 's' : ''}`}
        actions={
          <PermissionGuard permission={PERMISSIONS.CONTRACTS_CREATE}>
            <Link href="/contracts/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition">
              <Plus size={16} /> New Contract
            </Link>
          </PermissionGuard>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search contracts..." onSearch={setSearch} className="flex-1 min-w-48" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['Running', 'Expired', 'Upcoming'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={contracts}
        loading={loading}
        emptyMessage="No contracts found."
        onRowClick={(row) => router.push(`/contracts/${row.id}`)}
        total={contracts.length}
      />
    </div>
  );
}
