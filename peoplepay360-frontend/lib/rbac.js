export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_MANAGER: 'HR_MANAGER',
  HR_PAYROLL_USER: 'HR_PAYROLL_USER',
  HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
  ADMIN: 'ADMIN',
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.HR_MANAGER]: 'HR Manager',
  [ROLES.HR_PAYROLL_USER]: 'Payroll User',
  [ROLES.HR_PAYROLL_MANAGER]: 'Payroll Manager',
  [ROLES.ADMIN]: 'Administrator',
};

export const PERMISSION_MATRIX = {
  employees: {
    view: [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    create: [ROLES.ADMIN, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_MANAGER],
    edit: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    delete: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    provisionRole: [ROLES.ADMIN],
  },
  contracts: {
    view: [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    edit: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  },
  attendance: {
    view: [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    edit: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  },
  timeOff: {
    view: [ROLES.EMPLOYEE, ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    approve: [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  },
  payroll: {
    view: [ROLES.EMPLOYEE, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    createPayrun: [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    manageRules: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
  },
};

export function canAccessModule(role, moduleName) {
  // If role is loading or absent, default to true so sidebar navigation is never hidden
  if (!role) return true;
  const normalizedRole = String(role).toUpperCase();
  const permissions = PERMISSION_MATRIX[moduleName];
  if (!permissions) return true;
  return permissions.view.includes(normalizedRole);
}

export function canPerformAction(role, moduleName, action) {
  if (!role) return action === 'view';
  const normalizedRole = String(role).toUpperCase();
  const modulePermissions = PERMISSION_MATRIX[moduleName];
  if (!modulePermissions || !modulePermissions[action]) return false;
  return modulePermissions[action].includes(normalizedRole);
}
