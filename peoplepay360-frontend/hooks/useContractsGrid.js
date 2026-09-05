'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function useContractsGrid(employeeId = null) {
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

          const endpoint = employeeId
            ? `/api/employees/${employeeId}/contracts`
            : '/api/contracts/list';

          const response = await apiClient.post(endpoint, payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Contracts Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [employeeId]);

  return { datasource };
}
