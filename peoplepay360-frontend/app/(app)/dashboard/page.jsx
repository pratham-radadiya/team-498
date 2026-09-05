'use client';

import { useAuth } from '../../../src/context/AuthContext.jsx';
import { ROLES, PERMISSIONS } from '../../../src/lib/permissions.js';
import EmployeeDashboard from '../../../src/components/dashboard/EmployeeDashboard.jsx';
import HRManagerDashboard from '../../../src/components/dashboard/HRManagerDashboard.jsx';
import HRPayrollUserDashboard from '../../../src/components/dashboard/HRPayrollUserDashboard.jsx';
import HRPayrollManagerDashboard from '../../../src/components/dashboard/HRPayrollManagerDashboard.jsx';
import AdminDashboard from '../../../src/components/dashboard/AdminDashboard.jsx';

export default function DashboardPage() {
  const { role } = useAuth();

  if (role === ROLES.ADMIN) return <AdminDashboard />;
  if (role === ROLES.HR_PAYROLL_MANAGER) return <HRPayrollManagerDashboard />;
  if (role === ROLES.HR_PAYROLL_USER) return <HRPayrollUserDashboard />;
  if (role === ROLES.HR_MANAGER) return <HRManagerDashboard />;
  return <EmployeeDashboard />;
}
