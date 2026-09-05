'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { formatDateTime, formatWorkedHours, getStatusBadgeClass } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { Clock, LogIn, LogOut, Eye, ChevronRight, ChevronLeft, User } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function AttendanceList({
  records = [],
  loading = false,
  onRecordClick,
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
              <User className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block text-xs truncate">
                {params.value || params.data?.employeeId || 'Employee'}
              </span>
              <span className="text-[10px] text-slate-500 block leading-none">
                ID: {params.data?.employeeId}
              </span>
            </div>
          </div>
        ),
      },
      {
        headerName: 'Check In',
        field: 'checkIn',
        flex: 2,
        minWidth: 170,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold py-1">
            <LogIn className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{formatDateTime(params.value)}</span>
          </div>
        ),
      },
      {
        headerName: 'Check Out',
        field: 'checkOut',
        flex: 2,
        minWidth: 170,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold py-1">
            <LogOut className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{params.value ? formatDateTime(params.value) : 'Active Session'}</span>
          </div>
        ),
      },
      {
        headerName: 'Worked Hours',
        field: 'workedHours',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 py-1">
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold">
              {formatWorkedHours(params.value)}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Overtime',
        field: 'overtime',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 py-1">
            <span
              className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                params.value > 0
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-slate-50 text-slate-500'
              }`}
            >
              {formatWorkedHours(params.value)}
            </span>
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
              {params.value || 'Present'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Action',
        field: 'id',
        width: 90,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-center items-center h-full py-1">
            <button
              onClick={() => onRecordClick && onRecordClick(params.value)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="View Attendance Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onRecordClick]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && records.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || records.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={records}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onRecordClick && onRecordClick(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No attendance records found</span>"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || records.length} items)
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
