'use client';

import { useMemo } from 'react';
import apiClient from '@/lib/api-client';

export function useAttendanceGrid(employeeIdFilter = null) {
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

          const response = await apiClient.post('/api/attendance/list', payload);
          const { rows = [], rowCount = 0 } = response.data || {};
          params.successCallback(rows, rowCount);
        } catch (error) {
          console.error('Attendance Grid fetch failed:', error);
          params.failCallback();
        }
      },
    };
  }, [employeeIdFilter]);

  return { datasource };
}
