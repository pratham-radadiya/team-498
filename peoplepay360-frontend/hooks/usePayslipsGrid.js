'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function usePayslipsGrid(employeeIdFilter = null, payrunIdFilter = null) {
  const datasource = useMemo(() => {
    return {
      getRows: async (params) => {
        try {
          const filterModel = { ...(params.filterModel || {}) };
          if (employeeIdFilter) {
            filterModel.employeeId = { filterType: 'text', type: 'equals', filter: employeeIdFilter };
          }
          if (payrunIdFilter) {
            filterModel.payrunId = { filterType: 'text', type: 'equals', filter: payrunIdFilter };
          }

          const payload = {
            startRow: params.startRow,
            endRow: params.endRow,
            sortModel: params.sortModel || [],
            filterModel,
          };

          const response = await apiClient.post('/api/payslips/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Payslips Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [employeeIdFilter, payrunIdFilter]);

  return { datasource };
}
