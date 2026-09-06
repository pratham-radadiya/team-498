'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { User, Eye, Calendar, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PayslipList({
  payslips = [],
  loading = false,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSelectPayslip,
  onDownloadPdf,
}) {
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Employee',
        field: 'employeeName',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => {
          const empName = params.value || params.data?.employee?.name || params.data?.employeeId || 'Employee';
          return (
            <div className="flex items-center gap-3 py-1">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors block text-xs truncate">
                  {empName}
                </span>
                <span className="text-[10px] text-slate-500 block leading-none">
                  {params.data?.contract?.contractReference || params.data?.contractReference || 'Contract'}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Pay Period',
        field: 'periodStart',
        flex: 2,
        minWidth: 190,
        cellRenderer: (params) => {
          const start = params.data?.startDate || params.data?.periodStart || params.value;
          const end = params.data?.endDate || params.data?.periodEnd;
          return (
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium py-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>
                {formatDate(start)} → {formatDate(end)}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Worked Days',
        field: 'workedDays',
        flex: 1,
        minWidth: 110,
        cellRenderer: (params) => (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold">
            {params.value !== undefined && params.value !== null ? `${params.value} days` : '—'}
          </span>
        ),
      },
      {
        headerName: 'Basic Salary',
        field: 'basicWage',
        flex: 1.3,
        minWidth: 120,
        cellRenderer: (params) => {
          const val = params.value !== undefined && params.value !== null ? params.value : params.data?.basic;
          return (
            <span className="font-mono text-xs font-bold text-slate-900">
              {val !== null && val !== undefined ? formatCurrency(val) : '—'}
            </span>
          );
        },
      },
      {
        headerName: 'Gross Salary',
        field: 'grossPay',
        flex: 1.3,
        minWidth: 120,
        cellRenderer: (params) => {
          const val = params.value !== undefined && params.value !== null ? params.value : params.data?.gross;
          return (
            <span className="font-mono text-xs font-bold text-slate-900">
              {val !== null && val !== undefined ? formatCurrency(val) : '—'}
            </span>
          );
        },
      },
      {
        headerName: 'Net Salary',
        field: 'netPay',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => {
          const val = params.value !== undefined && params.value !== null ? params.value : params.data?.net;
          return (
            <span className="font-mono text-xs font-black text-emerald-700">
              {val !== null && val !== undefined ? formatCurrency(val) : '—'}
            </span>
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
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeClass(params.value)}`}>
              {params.value || 'Draft'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Actions',
        field: 'id',
        width: 110,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          if (!params.data) return null;
          const targetId = params.data.id || params.data._id || params.value;
          if (!targetId || targetId === 'undefined') return null;

          return (
            <div className="flex items-center justify-end gap-1.5 h-full py-1 pr-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectPayslip) {
                    onSelectPayslip(targetId);
                  }
                }}
                className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
                title="View Payslip Details"
                aria-label="View Payslip Details"
              >
                <Eye className="w-4 h-4" />
              </button>

              {onDownloadPdf && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadPdf(targetId, params.data.employeeName || params.data.employee?.name);
                  }}
                  className="p-1.5 rounded-xl text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all cursor-pointer"
                  title="Download PDF Payslip"
                  aria-label="Download PDF Payslip"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onSelectPayslip, onDownloadPdf]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && payslips.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || payslips.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col rounded-3xl">
      <div className="w-full text-xs" style={{ height: '440px' }}>
        <AgGridReact
          rowData={payslips}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => {
            const targetId = e.data?.id || e.data?._id || e.data?.payslipId;
            if (onSelectPayslip && targetId && targetId !== 'undefined') {
              onSelectPayslip(targetId);
            }
          }}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No payslips found</span>"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || payslips.length} items)
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
