'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useDashboard(initialFilters = {}) {
  const [filters, setFilters] = useState({
    periodStart: '',
    periodEnd: '',
    department: '',
    employeeType: '',
    company: '',
    ...initialFilters,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState({ totalNetSalary: 0, payslipCount: 0, byStatus: [] });
  const [salaryByDept, setSalaryByDept] = useState([]);
  const [salaryTrend, setSalaryTrend] = useState([]);
  const [attendanceOverview, setAttendanceOverview] = useState({ byStatus: [], missingCheckouts: 0 });
  const [timeOffOverview, setTimeOffOverview] = useState({ requestsByStatus: [], remainingByType: [] });
  const [deptOverview, setDeptOverview] = useState([]);

  const fetchDashboardData = useCallback(async (currentFilters) => {
    setLoading(true);
    setError(null);

    // Build payload without empty strings
    const payload = {};
    if (currentFilters.periodStart) payload.periodStart = currentFilters.periodStart;
    if (currentFilters.periodEnd) payload.periodEnd = currentFilters.periodEnd;
    if (currentFilters.department) payload.department = currentFilters.department;
    if (currentFilters.employeeType) payload.employeeType = currentFilters.employeeType;
    if (currentFilters.company) payload.company = currentFilters.company;

    const reqOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    };

    try {
      const [
        kpisRes,
        deptSalaryRes,
        trendRes,
        attendanceRes,
        timeOffRes,
        deptOverviewRes,
      ] = await Promise.allSettled([
        fetch(`${API_BASE}/api/dashboard/kpis`, reqOptions),
        fetch(`${API_BASE}/api/dashboard/salary-by-department`, reqOptions),
        fetch(`${API_BASE}/api/dashboard/salary-trend`, reqOptions),
        fetch(`${API_BASE}/api/dashboard/attendance-overview`, reqOptions),
        fetch(`${API_BASE}/api/dashboard/timeoff-overview`, reqOptions),
        fetch(`${API_BASE}/api/dashboard/department-overview`, reqOptions),
      ]);

      if (kpisRes.status === 'fulfilled' && kpisRes.value.ok) {
        const data = await kpisRes.value.json();
        setKpis(data);
      }
      if (deptSalaryRes.status === 'fulfilled' && deptSalaryRes.value.ok) {
        const data = await deptSalaryRes.value.json();
        setSalaryByDept(Array.isArray(data) ? data : []);
      }
      if (trendRes.status === 'fulfilled' && trendRes.value.ok) {
        const data = await trendRes.value.json();
        setSalaryTrend(Array.isArray(data) ? data : []);
      }
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
        const data = await attendanceRes.value.json();
        setAttendanceOverview(data);
      }
      if (timeOffRes.status === 'fulfilled' && timeOffRes.value.ok) {
        const data = await timeOffRes.value.json();
        setTimeOffOverview(data);
      }
      if (deptOverviewRes.status === 'fulfilled' && deptOverviewRes.value.ok) {
        const data = await deptOverviewRes.value.json();
        setDeptOverview(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(filters);
  }, [filters, fetchDashboardData]);

  const refreshAll = () => {
    fetchDashboardData(filters);
  };

  const resetFilters = () => {
    setFilters({
      periodStart: '',
      periodEnd: '',
      department: '',
      employeeType: '',
      company: '',
    });
  };

  return {
    filters,
    setFilters,
    loading,
    error,
    kpis,
    salaryByDept,
    salaryTrend,
    attendanceOverview,
    timeOffOverview,
    deptOverview,
    refreshAll,
    resetFilters,
  };
}
