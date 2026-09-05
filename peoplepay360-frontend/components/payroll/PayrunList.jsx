'use client';

import { useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { usePayrunsGrid } from '@/hooks/usePayrunsGrid';
import { formatDate, getStatusBadgeClass } from '@/lib/formatters';
import { CreditCard, Eye, Calendar, Users } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PayrunList({
  refreshTrigger = 0,
  onSelectPayrun,
  statusFilter = null,
}) {
  const gridRef = useRef(null);
  const { datasource } = usePayrunsGrid(statusFilter);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [refreshTrigger, statusFilter]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Payrun Name',
        field: 'name',
        flex: 2,
        minWidth: 180,
        cellRenderer: (params) => (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs truncate">
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Pay Period',
        field: 'periodStart',
        flex: 2,
        minWidth: 190,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium py-1">
            <Calendar className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>
              {formatDate(params.data?.periodStart)} → {formatDate(params.data?.periodEnd)}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Payslips Count',
        field: 'payslipCount',
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-800 font-semibold py-1">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{params.value !== undefined ? `${params.value} Payslips` : '0 Payslips'}</span>
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
              {params.value || 'Draft'}
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
              onClick={() => onSelectPayrun && onSelectPayrun(params.value)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 shadow-2xs transition-all duration-200 cursor-pointer"
              title="View Payrun Details"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-[11px]">View</span>
            </button>
          </div>
        ),
      },
    ],
    [onSelectPayrun]
  );

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="card-flat overflow-hidden bg-white border border-slate-200 shadow-xs animate-fade-in">
      <div className="w-full text-xs" style={{ height: '480px' }}>
        <AgGridReact
          ref={gridRef}
          rowModelType="infinite"
          datasource={datasource}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          cacheBlockSize={20}
          maxBlocksInCache={10}
          infiniteInitialRowCount={50}
          onRowClicked={(e) => onSelectPayrun && onSelectPayrun(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No payruns found</span>"
        />
      </div>
    </div>
  );
}
