export const ROLES = {
  EMPLOYEE: "EMPLOYEE",
  HR_MANAGER: "HR_MANAGER",
  HR_PAYROLL_USER: "HR_PAYROLL_USER",
  HR_PAYROLL_MANAGER: "HR_PAYROLL_MANAGER",
  ADMIN: "ADMIN",
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: "Employee",
  [ROLES.HR_MANAGER]: "HR Manager",
  [ROLES.HR_PAYROLL_USER]: "HR Payroll User",
  [ROLES.HR_PAYROLL_MANAGER]: "HR Payroll Manager",
  [ROLES.ADMIN]: "Admin",
};

export const ALL_ROLES = Object.values(ROLES);

export const EMPLOYEE_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};
