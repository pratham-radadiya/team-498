'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function usePayrunsGrid(statusFilter = null) {
  const datasource = useMemo(() => {
    return {
      getRows: async (params) => {
        try {
          const filterModel = { ...(params.filterModel || {}) };
          if (statusFilter) {
            filterModel.status = { type: 'equals', filter: statusFilter };
          }

          const payload = {
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel || [],
            filterModel,
          };

          const response = await apiClient.post('/api/payruns/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Payruns Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [statusFilter]);

  return { datasource };
}
