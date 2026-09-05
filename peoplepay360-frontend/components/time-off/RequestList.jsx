'use client';

import { useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useTimeOffRequestsGrid } from '@/hooks/useTimeOffRequestsGrid';
import { getStatusBadgeClass, formatDate } from '@/lib/formatters';
import { User, Tag, CheckCircle2, XCircle, Eye, ChevronRight, Calendar } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function RequestList({
  refreshTrigger = 0,
  onSelectRequest,
  onApproveRequest,
  onRefuseRequest,
  canApprove = false,
  employeeIdFilter = null,
}) {
  const gridRef = useRef(null);
  const { datasource } = useTimeOffRequestsGrid(employeeIdFilter);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [refreshTrigger, employeeIdFilter]);

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
        width: 180,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => {
          const isPending = (params.data?.status || 'To Approve') === 'To Approve' || params.data?.status === 'Pending';
          return (
            <div className="flex items-center justify-end gap-1.5 py-1">
              {isPending && canApprove && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApproveRequest && onApproveRequest(params.value);
                    }}
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Approve request"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRefuseRequest && onRefuseRequest(params.value);
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    title="Refuse request"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Refuse</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onSelectRequest && onSelectRequest(params.value)}
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors ml-1"
                title="View Request Details"
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
          onRowClicked={(e) => onSelectRequest && onSelectRequest(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No time off requests found</span>"
        />
      </div>
    </div>
  );
}
