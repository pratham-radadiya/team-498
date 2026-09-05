'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function useTimeOffTypesGrid() {
  const datasource = useMemo(() => {
    return {
      getRows: async (params) => {
        try {
          const payload = {
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel || [],
            filterModel: params.filterModel || {},
          };

          const response = await apiClient.post('/api/timeoff/types/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Time Off Types Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, []);

  return { datasource };
}
