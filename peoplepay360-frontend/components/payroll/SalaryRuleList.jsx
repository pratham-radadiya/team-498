'use client';

import { useMemo, useRef, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { useSalaryRulesGrid } from '@/hooks/useSalaryRulesGrid';
import { FileCode, Eye, Layers, Hash } from 'lucide-react';

ModuleRegistry.registerModules([AllCommunityModule]);

export default function SalaryRuleList({
  refreshTrigger = 0,
  onSelectRule,
  structureIdFilter = null,
}) {
  const gridRef = useRef(null);
  const { datasource } = useSalaryRulesGrid(structureIdFilter);

  useEffect(() => {
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.refreshInfiniteCache();
    }
  }, [refreshTrigger, structureIdFilter]);

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
        width: 95,
        pinned: 'right',
        sortable: false,
        filter: false,
        cellRenderer: (params) => (
          <div className="flex justify-center items-center h-full py-1">
            <button
              onClick={() => onSelectRule && onSelectRule(params.value)}
              className="group flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-600 hover:text-white border border-slate-200 hover:border-indigo-600 shadow-2xs transition-all duration-200 cursor-pointer"
              title="View Rule Details"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" />
              <span className="text-[11px]">View</span>
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
          onRowClicked={(e) => onSelectRule && onSelectRule(e.data?.id)}
          rowHeight={48}
          headerHeight={40}
          rowSelection="single"
          overlayNoRowsTemplate="<span class='text-xs text-slate-500 font-medium'>No salary rules found</span>"
        />
      </div>
    </div>
  );
}
