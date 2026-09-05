'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { getInitials, getStatusBadgeClass } from '@/lib/formatters';
import { ROLE_LABELS } from '@/lib/rbac';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Mail, Briefcase, Building, ShieldCheck, ChevronRight, ChevronLeft } from 'lucide-react';

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

export default function EmployeeList({
  employees = [],
  loading = false,
  onEmployeeClick,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  // Custom Cell Renderers for AG Grid with clean minimal styling (no heavy backgrounds on column data)
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Employee',
        field: 'name',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params) => {
          const emp = params.data;
          if (!emp) return null;
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(emp.name)}
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors block text-xs truncate">
                  {emp.name}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none">
                  {emp.company || 'PeoplePay360'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Work Email',
        field: 'email',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => {
          if (!params.value) return '—';
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-mono py-1">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Job Position',
        field: 'jobPosition',
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{params.value || '—'}</span>
          </div>
        ),
      },
      {
        headerName: 'Department',
        field: 'department',
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{params.value || 'Unassigned'}</span>
          </div>
        ),
      },
      {
        headerName: 'Role',
        field: 'role',
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params) => {
          if (!params.value) return '—';
          return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 py-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>{ROLE_LABELS[params.value] || params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1,
        minWidth: 110,
        cellRenderer: (params) => (
          <div className="py-1">
            <span className={`badge ${getStatusBadgeClass(params.value)}`}>
              {params.value || 'Active'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Action',
        field: 'id',
        width: 80,
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-end py-1">
            <button
              onClick={() => onEmployeeClick && onEmployeeClick(params.value)}
              className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onEmployeeClick]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && employees.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || employees.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      {/* AG Grid Table Container */}
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={employees}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onEmployeeClick && onEmployeeClick(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No employee records found</span>"
        />
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
          <span>
            Page <strong className="font-semibold text-slate-900">{page}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || employees.length} items)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
