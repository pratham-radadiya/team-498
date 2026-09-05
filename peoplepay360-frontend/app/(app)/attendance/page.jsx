'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageHeader from '../../../src/components/common/PageHeader.jsx';
import DataTable from '../../../src/components/common/DataTable.jsx';
import StatusBadge from '../../../src/components/common/StatusBadge.jsx';
import SearchBar from '../../../src/components/common/SearchBar.jsx';
import { PermissionGuard } from '../../../src/components/common/Guards.jsx';
import { mockAttendance } from '../../../src/mock/attendance.js';
import { useAuth } from '../../../src/context/AuthContext.jsx';
import { PERMISSIONS, ROLES } from '../../../src/lib/permissions.js';
import { DEPARTMENTS } from '../../../src/mock/employees.js';
import { Plus, AlertCircle } from 'lucide-react';

export default function AttendancePage() {
  const router = useRouter();
  const { role, user } = useAuth();
  const searchParams = useSearchParams();
  const empFilter = searchParams.get('employee');

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 20;

  const isSelfOnly = role === ROLES.EMPLOYEE;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let results = [...mockAttendance];
      // Employees only see their own records
      if (isSelfOnly) results = results.filter((a) => a.employeeId === user?.employeeId);
      if (empFilter) results = results.filter((a) => a.employeeId === empFilter);
      if (search) results = results.filter((a) => a.employeeName.toLowerCase().includes(search.toLowerCase()));
      if (department) results = results.filter((a) => a.department === department);
      if (status) results = results.filter((a) => a.status === status);
      setRecords(results);
      setLoading(false);
    }, 400);
  }, [search, department, status, empFilter, isSelfOnly, user?.employeeId]);

  const columns = [
    { key: 'employeeName', label: 'Employee', render: (v, row) => (
      <div>
        <p className="font-medium text-slate-800">{v}</p>
        <p className="text-xs text-slate-400">{row.department}</p>
      </div>
    )},
    { key: 'checkIn', label: 'Check In', render: (v) => v ? <><span className="font-mono text-xs">{v.split(' ')[0]}</span><br /><span className="text-slate-500 text-xs">{v.split(' ')[1]}</span></> : '—' },
    { key: 'checkOut', label: 'Check Out', render: (v) => v ? <span className="text-xs">{v.split(' ')[1]}</span> : <span className="text-amber-600 text-xs">Missing</span> },
    { key: 'workedHours', label: 'Worked Hours', render: (v) => v ? `${v}h` : '—' },
    { key: 'overtime', label: 'Overtime', render: (v) => v > 0 ? <span className="text-blue-600 font-medium">{v}h</span> : <span className="text-slate-300">—</span> },
    { key: 'status', label: 'Status', render: (v, row) => (
      <div className="flex items-center gap-1.5">
        <StatusBadge status={v} size="xs" />
        {row.manuallyEdited && <span title="Manually edited" className="text-purple-500"><AlertCircle size={12} /></span>}
      </div>
    )},
  ];

  const paged = records.slice((page - 1) * LIMIT, page * LIMIT);

  return (
    <div className="space-y-5">
      {empFilter && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5 text-sm text-indigo-700 flex items-center gap-2">
          Showing attendance for employee: <strong>{empFilter}</strong>
          <Link href="/attendance" className="ml-auto underline text-xs">Show all</Link>
        </div>
      )}

      <PageHeader
        title={isSelfOnly ? 'My Attendance' : 'Attendance'}
        subtitle={`${records.length} records`}
      />

      <div className="flex flex-wrap items-center gap-3">
        {!isSelfOnly && <SearchBar placeholder="Search by employee..." onSearch={setSearch} className="flex-1 min-w-48" />}
        {!isSelfOnly && (
          <select value={department} onChange={(e) => setDepartment(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        )}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['Present','Late','Absent','Overtime','Missing Check-out','Manually Edited'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={paged}
        loading={loading}
        emptyMessage="No attendance records found."
        onRowClick={(row) => router.push(`/attendance/${row.id}`)}
        page={page}
        total={records.length}
        limit={LIMIT}
        onPageChange={setPage}
      />
    </div>
  );
}
