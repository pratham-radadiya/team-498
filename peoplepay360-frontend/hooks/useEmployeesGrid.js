'use client';

import { useState, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';

export function useEmployeesGrid() {
  const [gridApi, setGridApi] = useState(null);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Client-side cache / fallback state
  const [rows, setRows] = useState([]);

  // AG Grid Infinite / Server Datasource Implementation
  const createDatasource = useCallback((searchQuery = '', roleFilter = '') => {
    return {
      getRows: async (params) => {
        const { startRow, endRow, sortModel, filterModel } = params;
        setLoading(true);

        try {
          // Construct filterModel payload for API
          const combinedFilterModel = { ...filterModel };

          if (searchQuery.trim()) {
            combinedFilterModel.name = {
              filterType: 'text',
              type: 'contains',
              filter: searchQuery.trim(),
            };
          }

          if (roleFilter) {
            combinedFilterModel.role = {
              filterType: 'text',
              type: 'equals',
              filter: roleFilter,
            };
          }

          const { data } = await apiClient.post('/api/employees/list', {
            startRow,
            endRow,
            sortModel: sortModel || [],
            filterModel: combinedFilterModel,
          });

          if (data) {
            const fetchedRows = data.rows || [];
            const rowCount = data.rowCount ?? fetchedRows.length;
            setRows(fetchedRows);
            setTotalRows(rowCount);
            params.successCallback(fetchedRows, rowCount);
          } else {
            params.failCallback();
          }
        } catch (err) {
          console.error('AG Grid datasource error:', err);
          params.failCallback();
        } finally {
          setLoading(false);
        }
      },
    };
  }, []);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const refreshGrid = useCallback(() => {
    if (gridApi) {
      gridApi.purgeInfiniteCache();
      gridApi.refreshInfiniteCache();
    }
  }, [gridApi]);

  return {
    gridApi,
    rows,
    totalRows,
    loading,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
    createDatasource,
    onGridReady,
    refreshGrid,
  };
}
