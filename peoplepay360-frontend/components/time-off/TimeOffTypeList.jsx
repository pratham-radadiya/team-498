'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { getStatusBadgeClass } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Calendar, ShieldCheck, Eye, ChevronRight, ChevronLeft, Tag } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TimeOffTypeList({
  types = [],
  loading = false,
  onTypeClick,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Policy Type Name',
        field: 'name',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block text-xs truncate">
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Unit',
        field: 'unit',
        flex: 1,
        minWidth: 100,
        cellRenderer: (params) => (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-semibold text-xs">
            {params.value || 'Days'}
          </span>
        ),
      },
      {
        headerName: 'Requires Allocation',
        field: 'requiresAllocation',
        flex: 1.5,
        minWidth: 160,
        cellRenderer: (params) => (
          <span className={`badge ${params.value ? 'badge-primary' : 'badge-info'}`}>
            {params.value ? 'Yes (Strict Balance)' : 'No (Unlimited)'}
          </span>
        ),
      },
      {
        headerName: 'Approval Role',
        field: 'approvalRole',
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{params.value || 'Manager'}</span>
          </div>
        ),
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
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-center items-center h-full py-1">
            <button
              onClick={() => onTypeClick && onTypeClick(params.value)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shrink-0"
              title="View Policy Details"
              aria-label="View Policy Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onTypeClick]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && types.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || types.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={types}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onTypeClick && onTypeClick(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No time off types found</span>"
        />
      </div>

      {/* Pagination Bar */}
      <div className="px-4 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
            className="bg-white border border-slate-300 rounded-md px-2 py-1 text-xs focus:outline-none focus:border-indigo-500 font-semibold"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || types.length} items)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
