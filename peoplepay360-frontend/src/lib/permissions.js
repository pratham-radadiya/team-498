/**
 * PeoplePay360 — Centralized Frontend Permission Matrix
 *
 * This is the single source of truth for all role-based UI access control.
 * Backend enforces actual authorization; this is purely a UX feature.
 */

export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_MANAGER: 'HR_MANAGER',
  HR_PAYROLL_USER: 'HR_PAYROLL_USER',
  HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  EMPLOYEE: 'Employee',
  HR_MANAGER: 'HR Manager',
  HR_PAYROLL_USER: 'HR Payroll User',
  HR_PAYROLL_MANAGER: 'HR Payroll Manager',
  ADMIN: 'Admin',
};

export const ROLE_COLORS = {
  EMPLOYEE: 'blue',
  HR_MANAGER: 'green',
  HR_PAYROLL_USER: 'purple',
  HR_PAYROLL_MANAGER: 'orange',
  ADMIN: 'red',
};

/**
 * Permission keys used across the application.
 * Format: module.action or module.action.scope
 */
export const PERMISSIONS = {
  // Employee permissions
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_READ_SELF: 'employees.read.self',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',

  // Contract permissions
  CONTRACTS_READ: 'contracts.read',
  CONTRACTS_CREATE: 'contracts.create',
  CONTRACTS_UPDATE: 'contracts.update',
  CONTRACTS_DELETE: 'contracts.delete',

  // Schedule permissions
  SCHEDULES_READ: 'schedules.read',
  SCHEDULES_CREATE: 'schedules.create',
  SCHEDULES_UPDATE: 'schedules.update',
  SCHEDULES_DELETE: 'schedules.delete',

  // Attendance permissions
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_READ_SELF: 'attendance.read.self',
  ATTENDANCE_CREATE: 'attendance.create',
  ATTENDANCE_UPDATE: 'attendance.update',
  ATTENDANCE_CORRECT: 'attendance.correct',

  // Time Off permissions
  TIMEOFF_READ: 'timeoff.read',
  TIMEOFF_READ_SELF: 'timeoff.read.self',
  TIMEOFF_CREATE: 'timeoff.create',
  TIMEOFF_APPROVE: 'timeoff.approve',
  TIMEOFF_TYPES_MANAGE: 'timeoff.types.manage',
  ALLOCATIONS_MANAGE: 'allocations.manage',

  // Payroll permissions
  PAYRUNS_CREATE: 'payruns.create',
  PAYRUNS_READ: 'payruns.read',
  PAYRUNS_UPDATE: 'payruns.update',
  PAYRUNS_DELETE: 'payruns.delete',
  PAYSLIPS_CREATE: 'payslips.create',
  PAYSLIPS_READ: 'payslips.read',
  PAYSLIPS_READ_SELF: 'payslips.read.self',
  PAYSLIPS_UPDATE: 'payslips.update',
  SALARY_STRUCTURES_READ: 'salary_structures.read',
  SALARY_STRUCTURES_MANAGE: 'salary_structures.manage',
  SALARY_RULES_READ: 'salary_rules.read',
  SALARY_RULES_MANAGE: 'salary_rules.manage',

  // Payrun workflow action permissions
  PAYRUN_CREATE: 'payrun.create',
  PAYRUN_COMPUTE: 'payrun.compute',
  PAYRUN_VALIDATE: 'payrun.validate',
  PAYRUN_MARK_PAID: 'payrun.mark_paid',
  PAYRUN_SEND_PAYSLIPS: 'payrun.send_payslips',

  // Dashboard permissions
  PAYROLL_DASHBOARD: 'payroll.dashboard',
  HR_DASHBOARD: 'hr.dashboard',

  // Admin permissions
  USERS_MANAGE: 'users.manage',
  ROLES_MANAGE: 'roles.manage',
  PERMISSIONS_MANAGE: 'permissions.manage',
  SETTINGS_MANAGE: 'settings.manage',

  // Reports
  REPORTS_READ: 'reports.read',
};

/**
 * Role → Permission mapping
 */
export const ROLE_PERMISSIONS = {
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.EMPLOYEES_READ_SELF,
    PERMISSIONS.ATTENDANCE_READ_SELF,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.TIMEOFF_READ_SELF,
    PERMISSIONS.TIMEOFF_CREATE,
    PERMISSIONS.PAYSLIPS_READ_SELF,
  ],

  [ROLES.HR_MANAGER]: [
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.CONTRACTS_READ,
    PERMISSIONS.CONTRACTS_CREATE,
    PERMISSIONS.CONTRACTS_UPDATE,
    PERMISSIONS.CONTRACTS_DELETE,
    PERMISSIONS.SCHEDULES_READ,
    PERMISSIONS.SCHEDULES_CREATE,
    PERMISSIONS.SCHEDULES_UPDATE,
    PERMISSIONS.SCHEDULES_DELETE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_CORRECT,
    PERMISSIONS.TIMEOFF_READ,
    PERMISSIONS.TIMEOFF_CREATE,
    PERMISSIONS.TIMEOFF_APPROVE,
    PERMISSIONS.TIMEOFF_TYPES_MANAGE,
    PERMISSIONS.ALLOCATIONS_MANAGE,
    PERMISSIONS.HR_DASHBOARD,
    PERMISSIONS.REPORTS_READ,
  ],

  [ROLES.HR_PAYROLL_USER]: [
    // All HR Manager permissions
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.CONTRACTS_READ,
    PERMISSIONS.CONTRACTS_CREATE,
    PERMISSIONS.CONTRACTS_UPDATE,
    PERMISSIONS.CONTRACTS_DELETE,
    PERMISSIONS.SCHEDULES_READ,
    PERMISSIONS.SCHEDULES_CREATE,
    PERMISSIONS.SCHEDULES_UPDATE,
    PERMISSIONS.SCHEDULES_DELETE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_CORRECT,
    PERMISSIONS.TIMEOFF_READ,
    PERMISSIONS.TIMEOFF_CREATE,
    PERMISSIONS.TIMEOFF_APPROVE,
    PERMISSIONS.TIMEOFF_TYPES_MANAGE,
    PERMISSIONS.ALLOCATIONS_MANAGE,
    PERMISSIONS.HR_DASHBOARD,
    PERMISSIONS.REPORTS_READ,
    // Payroll User additions
    PERMISSIONS.PAYRUNS_CREATE,
    PERMISSIONS.PAYRUNS_READ,
    PERMISSIONS.PAYRUNS_UPDATE,
    PERMISSIONS.PAYSLIPS_CREATE,
    PERMISSIONS.PAYSLIPS_READ,
    PERMISSIONS.PAYSLIPS_UPDATE,
    PERMISSIONS.SALARY_STRUCTURES_READ,
    PERMISSIONS.SALARY_RULES_READ,
    PERMISSIONS.PAYROLL_DASHBOARD,
    PERMISSIONS.PAYRUN_CREATE,
    PERMISSIONS.PAYRUN_COMPUTE,
  ],

  [ROLES.HR_PAYROLL_MANAGER]: [
    // All HR Payroll User permissions
    PERMISSIONS.EMPLOYEES_READ,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_UPDATE,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.CONTRACTS_READ,
    PERMISSIONS.CONTRACTS_CREATE,
    PERMISSIONS.CONTRACTS_UPDATE,
    PERMISSIONS.CONTRACTS_DELETE,
    PERMISSIONS.SCHEDULES_READ,
    PERMISSIONS.SCHEDULES_CREATE,
    PERMISSIONS.SCHEDULES_UPDATE,
    PERMISSIONS.SCHEDULES_DELETE,
    PERMISSIONS.ATTENDANCE_READ,
    PERMISSIONS.ATTENDANCE_CREATE,
    PERMISSIONS.ATTENDANCE_UPDATE,
    PERMISSIONS.ATTENDANCE_CORRECT,
    PERMISSIONS.TIMEOFF_READ,
    PERMISSIONS.TIMEOFF_CREATE,
    PERMISSIONS.TIMEOFF_APPROVE,
    PERMISSIONS.TIMEOFF_TYPES_MANAGE,
    PERMISSIONS.ALLOCATIONS_MANAGE,
    PERMISSIONS.HR_DASHBOARD,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.PAYRUNS_CREATE,
    PERMISSIONS.PAYRUNS_READ,
    PERMISSIONS.PAYRUNS_UPDATE,
    PERMISSIONS.PAYRUNS_DELETE,
    PERMISSIONS.PAYSLIPS_CREATE,
    PERMISSIONS.PAYSLIPS_READ,
    PERMISSIONS.PAYSLIPS_UPDATE,
    PERMISSIONS.SALARY_STRUCTURES_READ,
    PERMISSIONS.SALARY_STRUCTURES_MANAGE,
    PERMISSIONS.SALARY_RULES_READ,
    PERMISSIONS.SALARY_RULES_MANAGE,
    PERMISSIONS.PAYROLL_DASHBOARD,
    PERMISSIONS.PAYRUN_CREATE,
    PERMISSIONS.PAYRUN_COMPUTE,
    PERMISSIONS.PAYRUN_VALIDATE,
    PERMISSIONS.PAYRUN_MARK_PAID,
    PERMISSIONS.PAYRUN_SEND_PAYSLIPS,
  ],

  [ROLES.ADMIN]: Object.values(PERMISSIONS), // All permissions
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
}

/**
 * Check if a role has ANY of the given permissions
 */
export function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has ALL of the given permissions
 */
export function hasAllPermissions(role, permissions) {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Navigation items with role requirements
 */
export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: 'LayoutDashboard',
    roles: Object.values(ROLES),
  },
  {
    id: 'employees',
    label: 'Employees',
    href: '/employees',
    icon: 'Users',
    permissions: [PERMISSIONS.EMPLOYEES_READ, PERMISSIONS.EMPLOYEES_READ_SELF],
    anyPermission: true,
  },
  {
    id: 'contracts',
    label: 'Contracts',
    href: '/contracts',
    icon: 'FileText',
    permissions: [PERMISSIONS.CONTRACTS_READ],
  },
  {
    id: 'schedules',
    label: 'Schedules',
    href: '/schedules',
    icon: 'Calendar',
    permissions: [PERMISSIONS.SCHEDULES_READ],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    href: '/attendance',
    icon: 'Clock',
    permissions: [PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_READ_SELF],
    anyPermission: true,
  },
  {
    id: 'timeoff',
    label: 'Time Off',
    href: '/time-off',
    icon: 'Umbrella',
    permissions: [PERMISSIONS.TIMEOFF_READ, PERMISSIONS.TIMEOFF_READ_SELF],
    anyPermission: true,
    children: [
      { id: 'timeoff-dashboard', label: 'Overview', href: '/time-off' },
      { id: 'timeoff-requests', label: 'Requests', href: '/time-off/requests' },
      { id: 'timeoff-allocations', label: 'Allocations', href: '/time-off/allocations' },
      { id: 'timeoff-types', label: 'Leave Types', href: '/time-off/types', permissions: [PERMISSIONS.TIMEOFF_TYPES_MANAGE] },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    href: '/payroll',
    icon: 'DollarSign',
    permissions: [PERMISSIONS.PAYRUNS_READ, PERMISSIONS.PAYROLL_DASHBOARD],
    anyPermission: true,
    children: [
      { id: 'payroll-dashboard', label: 'Dashboard', href: '/payroll/dashboard', permissions: [PERMISSIONS.PAYROLL_DASHBOARD] },
      { id: 'payruns', label: 'Payruns', href: '/payroll/payruns', permissions: [PERMISSIONS.PAYRUNS_READ] },
      { id: 'payslips', label: 'Payslips', href: '/payroll/payslips', permissions: [PERMISSIONS.PAYSLIPS_READ] },
      { id: 'structures', label: 'Salary Structures', href: '/payroll/structures', permissions: [PERMISSIONS.SALARY_STRUCTURES_READ] },
      { id: 'rules', label: 'Salary Rules', href: '/payroll/rules', permissions: [PERMISSIONS.SALARY_RULES_READ] },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: 'BarChart3',
    permissions: [PERMISSIONS.REPORTS_READ],
  },
  {
    id: 'admin',
    label: 'Administration',
    href: '/admin',
    icon: 'Settings',
    permissions: [PERMISSIONS.USERS_MANAGE],
    children: [
      { id: 'admin-users', label: 'Users', href: '/admin/users' },
      { id: 'admin-roles', label: 'Roles', href: '/admin/roles' },
      { id: 'admin-permissions', label: 'Permissions', href: '/admin/permissions' },
      { id: 'admin-settings', label: 'Settings', href: '/admin/settings' },
    ],
  },
];
