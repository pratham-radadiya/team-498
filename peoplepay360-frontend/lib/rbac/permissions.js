import { ROLES } from "@/lib/constants/roles";

const { EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN } = ROLES;

/**
 * Module x action permission matrix, per project-overview.md §3.
 * Only "employees" and "users" are wired to real screens in Phase 1;
 * the rest are declared now so later phases don't need a rebuild of the RBAC layer.
 */
const PERMISSIONS = {
  employees: {
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  contracts: {
    // Employee can read (API forces them to their own record) but not manage.
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  workingSchedules: {
    // Employee can read (API forces them to their assigned schedule) but not manage.
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  attendance: {
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  timeOffTypes: {
    // Types are policy, not personal data — every role can read all of them.
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  allocations: {
    // Employee can read (API forces them to their own) — never self-service create.
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  timeOffRequests: {
    read: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [EMPLOYEE, HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    approve: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_MANAGER, HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  payroll: {
    read: [HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
  },
  // Neither Employee nor HR Manager get any access here — the one module
  // where HR Manager's usual "full HR" access doesn't carry over, per
  // Docs/api/phase-5-salary.md's role matrix.
  salaryStructures: {
    read: [HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_PAYROLL_MANAGER, ADMIN],
  },
  salaryRules: {
    read: [HR_PAYROLL_USER, HR_PAYROLL_MANAGER, ADMIN],
    create: [HR_PAYROLL_MANAGER, ADMIN],
    update: [HR_PAYROLL_MANAGER, ADMIN],
    delete: [HR_PAYROLL_MANAGER, ADMIN],
  },
  users: {
    read: [ADMIN],
    create: [ADMIN],
    update: [ADMIN],
  },
};

export function can(role, module, action) {
  return Boolean(PERMISSIONS[module]?.[action]?.includes(role));
}

export default PERMISSIONS;
