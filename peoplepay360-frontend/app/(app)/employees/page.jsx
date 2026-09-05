'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '../../../src/components/common/PageHeader.jsx';
import SearchBar from '../../../src/components/common/SearchBar.jsx';
import StatusBadge from '../../../src/components/common/StatusBadge.jsx';
import DataTable from '../../../src/components/common/DataTable.jsx';
import EmptyState from '../../../src/components/common/EmptyState.jsx';
import ConfirmDialog from '../../../src/components/common/ConfirmDialog.jsx';
import { PermissionGuard } from '../../../src/components/common/Guards.jsx';
import { getEmployeesApi, deleteEmployeeApi } from '../../../src/api/employeeApi.js';
import { DEPARTMENTS } from '../../../src/mock/employees.js';
import { PERMISSIONS } from '../../../src/lib/permissions.js';
import { Plus, LayoutGrid, List, Users, Trash2, Eye, Edit } from 'lucide-react';

// Employee avatar initials component
function Avatar({ name, initials, size = 'sm' }) {
  const colors = ['bg-indigo-500', 'bg-violet-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-orange-500'];
  const colorIdx = (name?.charCodeAt(0) || 0) % colors.length;
  const sizes = { sm: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  return (
    <div className={`${sizes[size] || sizes.sm} ${colors[colorIdx]} rounded-xl flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials || name?.charAt(0) || '?'}
    </div>
  );
}

// Kanban card
function KanbanCard({ employee, onDelete }) {
  return (
    <Link href={`/employees/${employee.id}`} className="bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md hover:border-indigo-300 transition-all group cursor-pointer block">
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={employee.name} initials={employee.initials} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition truncate">{employee.name}</p>
          <p className="text-xs text-slate-500 truncate">{employee.jobPosition}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">{employee.department}</p>
          <p className="text-xs text-slate-400">{employee.employeeType}</p>
        </div>
        <StatusBadge status={employee.status} size="xs" />
      </div>
    </Link>
  );
}

export default function EmployeesPage() {
  const router = useRouter();
  const [view, setView] = useState('kanban');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await getEmployeesApi({ search, department, status, page, limit: 20 });
      setEmployees(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, [search, department, status, page]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteEmployeeApi(deleteTarget.id);
      setDeleteTarget(null);
      fetchEmployees();
    } finally {
      setDeleting(false);
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Employee', render: (v, row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} initials={row.initials} size="sm" />
        <div>
          <p className="font-medium text-slate-900">{row.name}</p>
          <p className="text-xs text-slate-400">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'jobPosition', label: 'Job Position' },
    { key: 'department', label: 'Department' },
    { key: 'employeeType', label: 'Type' },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} size="xs" /> },
    { key: 'joiningDate', label: 'Joining Date' },
    { key: 'actions', label: '', render: (_, row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); router.push(`/employees/${row.id}`); }} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"><Eye size={15} /></button>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEES_UPDATE}>
          <button onClick={(e) => { e.stopPropagation(); router.push(`/employees/${row.id}?edit=true`); }} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"><Edit size={15} /></button>
        </PermissionGuard>
        <PermissionGuard permission={PERMISSIONS.EMPLOYEES_DELETE}>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"><Trash2 size={15} /></button>
        </PermissionGuard>
      </div>
    )},
  ];

  // Group for kanban
  const grouped = DEPARTMENTS.reduce((acc, dept) => {
    acc[dept] = employees.filter((e) => e.department === dept);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        subtitle={`${total} total employees across all departments`}
        actions={
          <PermissionGuard permission={PERMISSIONS.EMPLOYEES_CREATE}>
            <Link href="/employees/new" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition shadow-sm shadow-indigo-600/20">
              <Plus size={16} /> Add Employee
            </Link>
          </PermissionGuard>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchBar placeholder="Search employees..." onSearch={setSearch} className="flex-1 min-w-48" />
        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">All Statuses</option>
          {['Active', 'Inactive', 'On Leave'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden">
          <button onClick={() => setView('kanban')} className={`px-3 py-2.5 text-sm flex items-center gap-1.5 transition ${view === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <LayoutGrid size={15} /> Kanban
          </button>
          <button onClick={() => setView('list')} className={`px-3 py-2.5 text-sm flex items-center gap-1.5 transition ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
            <List size={15} /> List
          </button>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && !loading && (
        <div className="space-y-6">
          {DEPARTMENTS.map((dept) => {
            const deptEmployees = grouped[dept] || [];
            if (deptEmployees.length === 0 && department && department !== dept) return null;
            return (
              <div key={dept}>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">{dept}</h3>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{deptEmployees.length}</span>
                </div>
                {deptEmployees.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                    {deptEmployees.map((emp) => (
                      <KanbanCard key={emp.id} employee={emp} onDelete={() => setDeleteTarget(emp)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic py-2">No employees in this department.</p>
                )}
              </div>
            );
          })}
          {employees.length === 0 && !loading && (
            <EmptyState title="No employees found" description="Try adjusting your filters." icon={Users} />
          )}
        </div>
      )}

      {/* Loading kanban */}
      {view === 'kanban' && loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="flex-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4 mb-1.5" />
                  <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <DataTable
          columns={tableColumns}
          data={employees}
          loading={loading}
          emptyMessage="No employees found. Try adjusting your filters."
          onRowClick={(row) => router.push(`/employees/${row.id}`)}
          page={page}
          total={total}
          limit={20}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone.`}
        confirmLabel="Delete Employee"
        danger
        loading={deleting}
      />
    </div>
  );
}
