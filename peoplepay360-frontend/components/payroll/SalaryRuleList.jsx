'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { FileCode, Eye, Layers, Hash, ChevronRight, ChevronLeft } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function SalaryRuleList({
  rules = [],
  loading = false,
  totalCount = 0,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onSelectRule,
}) {
  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Seq',
        field: 'sequence',
        width: 80,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1 font-mono font-bold text-indigo-600 py-1 text-xs">
            <Hash className="w-3 h-3 text-indigo-400 shrink-0" />
            <span>{params.value}</span>
          </div>
        ),
      },
      {
        headerName: 'Rule Name',
        field: 'name',
        flex: 2,
        minWidth: 170,
        cellRenderer: (params) => (
          <div className="flex items-center gap-2.5 py-1">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0">
              <FileCode className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs truncate">
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Rule Code',
        field: 'code',
        flex: 1,
        minWidth: 110,
        cellRenderer: (params) => (
          <span className="font-mono text-slate-700 text-xs font-semibold uppercase">{params.value}</span>
        ),
      },
      {
        headerName: 'Category',
        field: 'category',
        flex: 1.2,
        minWidth: 120,
        cellRenderer: (params) => (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 font-bold text-xs">
            {params.value}
          </span>
        ),
      },
      {
        headerName: 'Salary Structure',
        field: 'structureName',
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1 font-semibold">
            <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{params.value || params.data?.structureId || 'Global'}</span>
          </div>
        ),
      },
      {
        headerName: 'Computation Method',
        field: 'computationMethod',
        flex: 1.3,
        minWidth: 140,
        cellRenderer: (params) => (
          <span className="text-xs text-slate-700 font-semibold">{params.value}</span>
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
              onClick={() => onSelectRule && onSelectRule(params.value)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all cursor-pointer"
              title="View Rule Details"
              aria-label="View Rule Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onSelectRule]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  if (loading && rules.length === 0) {
    return <SkeletonTable />;
  }

  const totalPages = Math.ceil((totalCount || rules.length) / pageSize) || 1;

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in flex flex-col">
      <div className="w-full text-xs" style={{ height: '420px' }}>
        <AgGridReact
          rowData={rules}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onRowClicked={(e) => onSelectRule && onSelectRule(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No salary rules found</span>"
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
            <strong className="font-semibold text-slate-900">{totalPages}</strong> ({totalCount || rules.length} items)
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
