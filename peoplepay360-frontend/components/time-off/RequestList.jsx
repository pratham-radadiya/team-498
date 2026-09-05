'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { getStatusBadgeClass, formatDate } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { User, Tag, CheckCircle2, XCircle, Eye, ChevronRight, ChevronLeft, Calendar } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function RequestList({
  requests = [],
  loading = false,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSelectRequest,
  onApproveRequest,
  onRefuseRequest,
  canApprove = false,
}) {
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Employee',
        field: 'employeeName',
        flex: 2,
        minWidth: 170,
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
        headerName: 'Time Off Type',
        field: 'typeName',
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold py-1">
            <Tag className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{params.value || params.data?.typeId}</span>
          </div>
        ),
      },
      {
        headerName: 'Period',
        field: 'startDate',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium py-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              {formatDate(params.data?.startDate)} → {formatDate(params.data?.endDate)}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Days',
        field: 'numberOfDays',
        flex: 1,
        minWidth: 90,
        cellRenderer: (params) => (
          <div className="py-1">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs border border-indigo-100 font-mono">
              {params.value || 1} {params.data?.typeUnit || 'Days'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Status',
        field: 'status',
        flex: 1.2,
        minWidth: 120,
        cellRenderer: (params) => (
          <div className="py-1">
            <span className={`badge ${getStatusBadgeClass(params.value)}`}>
              {params.value || 'To Approve'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Actions',
        field: 'id',
        width: 130,
        minWidth: 120,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const isPending = (params.data?.status || 'To Approve') === 'To Approve' || params.data?.status === 'Pending';
          return (
            <div className="flex items-center justify-end gap-1.5 h-full py-1 pr-2">
              {isPending && canApprove && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveRequest && onApproveRequest(params.value);
                    }}
                    className="p-1.5 rounded-xl text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all cursor-pointer shrink-0"
                    title="Approve"
                    aria-label="Approve"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefuseRequest && onRefuseRequest(params.value);
                    }}
                    className="p-1.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition-all cursor-pointer shrink-0"
                    title="Reject"
                    aria-label="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onSelectRequest && onSelectRequest(params.value)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer shrink-0"
                title="View Details"
                aria-label="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectRequest, onApproveRequest, onRefuseRequest, canApprove]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && requests.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || requests.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={requests}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onSelectRequest && onSelectRequest(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No time off requests found</span>"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || requests.length} items)
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
