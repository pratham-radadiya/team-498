'use client';

import { useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useSalaryStructuresGrid } from '@/hooks/useSalaryStructuresGrid';
import { getStatusBadgeClass } from '@/lib/formatters';
import { Layers, Eye, Users, FileCode } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function SalaryStructureList({
  refreshTrigger = 0,
  onSelectStructure,
}) {
  const gridRef = useRef(null);
  const { datasource } = useSalaryStructuresGrid();

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [refreshTrigger]);

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Structure Name',
        field: 'name',
        flex: 2,
        minWidth: 200,
        cellRenderer: (params) => (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs truncate">
              {params.value}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Salary Rules',
        field: 'ruleCount',
        flex: 1.2,
        minWidth: 130,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1 font-semibold">
            <FileCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{params.value !== undefined ? `${params.value} Rules` : '0 Rules'}</span>
          </div>
        ),
      },
      {
        headerName: 'Contracts Assigned',
        field: 'employeeCount',
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-700 py-1 font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{params.value !== undefined ? `${params.value} Employees` : '0 Employees'}</span>
          </div>
        ),
      },
      {
        headerName: 'Status',
        field: 'active',
        flex: 1,
        minWidth: 110,
        cellRenderer: (params) => (
          <div className="py-1">
            <span className={`badge ${params.value ? 'badge-success' : 'badge-danger'}`}>
              {params.value ? 'Active' : 'Inactive'}
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
              onClick={() => onSelectStructure && onSelectStructure(params.value)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
              title="View Structure Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [onSelectStructure]
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
          onRowClicked={(e) => onSelectStructure && onSelectStructure(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No salary structures found</span>"
        />
      </div>
    </div>
  );
}
