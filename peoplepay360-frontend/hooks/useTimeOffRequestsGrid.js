'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function useTimeOffRequestsGrid(employeeIdFilter = null) {
  const datasource = useMemo(() => {
    return {
      getRows: async (params) => {
        try {
          const filterModel = { ...(params.filterModel || {}) };
          if (employeeIdFilter) {
            filterModel.employeeId = { type: 'equals', filter: employeeIdFilter };
          }

          const payload = {
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel || [],
            filterModel,
          };

          const response = await apiClient.post('/api/timeoff/requests/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Time Off Requests Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [employeeIdFilter]);

  return { datasource };
}
