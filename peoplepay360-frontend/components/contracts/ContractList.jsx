'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { FileText, Calendar, Eye, ChevronRight, ChevronLeft } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function ContractList({
  contracts = [],
  loading = false,
  onContractClick,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) {
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Employee',
        field: 'employeeName',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block text-xs truncate">
                {params.value || params.data?.employeeId || 'Employee'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-none">
                {params.data?.department || 'General'}
              </span>
            </div>
          </div>
        ),
      },
      {
        headerName: 'Job Position',
        field: 'jobPosition',
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params) => (
          <span className="text-xs font-semibold text-slate-700">{params.value || '—'}</span>
        ),
      },
      {
        headerName: 'Start Date',
        field: 'startDate',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{formatDate(params.value)}</span>
          </div>
        ),
      },
      {
        headerName: 'End Date',
        field: 'endDate',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{params.value ? formatDate(params.value) : 'Ongoing'}</span>
          </div>
        ),
      },
      {
        headerName: 'Wage (INR)',
        field: 'wage',
        flex: 1.5,
        minWidth: 140,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1 text-xs font-bold text-slate-900 font-mono py-1">
            <span>{formatCurrency(params.value)}</span>
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
              {params.value || 'Running'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Action',
        field: 'id',
        width: 95,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-center items-center h-full py-1">
            <button
              onClick={() => onContractClick && onContractClick(params.value)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 shadow-2xs transition-all duration-200 cursor-pointer"
              title="View Contract Details"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-[11px]">View</span>
            </button>
          </div>
        ),
      },
    ],
    [onContractClick]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && contracts.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || contracts.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={contracts}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onContractClick && onContractClick(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No contract records found</span>"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || contracts.length} items)
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
