'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function useSalaryRulesGrid(structureIdFilter = null) {
  const datasource = useMemo(() => {
    return {
      getRows: async (params) => {
        try {
          const filterModel = { ...(params.filterModel || {}) };
          if (structureIdFilter) {
            filterModel.structureId = { type: 'equals', filter: structureIdFilter };
          }

          const payload = {
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel || [],
            filterModel,
          };

          const response = await apiClient.post('/api/salary-rules/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Salary Rules Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [structureIdFilter]);

  return { datasource };
}
