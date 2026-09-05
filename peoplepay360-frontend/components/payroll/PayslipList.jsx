'use client';

import { useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { usePayslipsGrid } from '@/hooks/usePayslipsGrid';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/formatters';
import { User, Eye, Calendar, FileText } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function PayslipList({
  refreshTrigger = 0,
  onSelectPayslip,
  employeeIdFilter = null,
  payrunIdFilter = null,
}) {
  const gridRef = useRef(null);
  const { datasource } = usePayslipsGrid(employeeIdFilter, payrunIdFilter);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [refreshTrigger, employeeIdFilter, payrunIdFilter]);

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
        headerName: 'Pay Period',
        field: 'periodStart',
        flex: 2,
        minWidth: 180,
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
        headerName: 'Worked Days',
        field: 'workedDays',
        flex: 1,
        minWidth: 100,
        cellRenderer: (params) => (
          <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold">
            {params.value !== undefined && params.value !== null ? `${params.value} days` : '—'}
          </span>
        ),
      },
      {
        headerName: 'Basic Salary',
        field: 'basic',
        flex: 1.3,
        minWidth: 120,
        cellRenderer: (params) => (
          <span className="font-mono text-xs font-bold text-slate-900">
            {params.value !== null && params.value !== undefined ? formatCurrency(params.value) : '—'}
          </span>
        ),
      },
      {
        headerName: 'Gross Salary',
        field: 'gross',
        flex: 1.3,
        minWidth: 120,
        cellRenderer: (params) => (
          <span className="font-mono text-xs font-bold text-slate-900">
            {params.value !== null && params.value !== undefined ? formatCurrency(params.value) : '—'}
          </span>
        ),
      },
      {
        headerName: 'Net Salary',
        field: 'net',
        flex: 1.5,
        minWidth: 130,
        cellRenderer: (params) => (
          <span className="font-mono text-xs font-black text-emerald-700">
            {params.value !== null && params.value !== undefined ? formatCurrency(params.value) : '—'}
          </span>
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
        width: 90,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-center items-center h-full py-1">
            <button
              onClick={() => onSelectPayslip && onSelectPayslip(params.value)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="View Payslip Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onSelectPayslip]
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
          onRowClicked={(e) => onSelectPayslip && onSelectPayslip(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No payslips found</span>"
        />
      </div>
    </div>
  );
}
