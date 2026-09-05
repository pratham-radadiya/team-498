export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  HR_MANAGER: 'HR_MANAGER',
  HR_PAYROLL_USER: 'HR_PAYROLL_USER',
  HR_PAYROLL_MANAGER: 'HR_PAYROLL_MANAGER',
  ADMIN: 'ADMIN',
}

const ALL_ROLES = Object.values(ROLES)
const NON_EMPLOYEE_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]
const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

// Module x role x action, per Docs/hr-payroll-backend.md "Role permission matrix".
// Read this table before adding a role check anywhere else in the codebase.
export const PERMISSION_MATRIX = {
  employees: { fullCrud: NON_EMPLOYEE_ROLES, ownRecordOnly: [ROLES.EMPLOYEE] },
  contracts: { fullCrud: NON_EMPLOYEE_ROLES, ownRecordOnly: [ROLES.EMPLOYEE] },
  workingSchedules: { fullCrud: NON_EMPLOYEE_ROLES, ownRecordOnly: [ROLES.EMPLOYEE] },
  attendance: { fullCrud: NON_EMPLOYEE_ROLES, createReadOwnOnly: [ROLES.EMPLOYEE] },
  timeOffTypes: { fullCrud: NON_EMPLOYEE_ROLES, readOnly: [ROLES.EMPLOYEE] },
  timeOffAllocations: { fullCrud: NON_EMPLOYEE_ROLES, readOwnOnly: [ROLES.EMPLOYEE] },
  timeOffRequests: { fullCrud: NON_EMPLOYEE_ROLES, createReadOwnOnly: [ROLES.EMPLOYEE] },
  salaryStructures: { fullCrud: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN], readOnly: [ROLES.HR_PAYROLL_USER] },
  salaryRules: { fullCrud: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN], readOnly: [ROLES.HR_PAYROLL_USER] },
  payruns: { fullCrud: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN], createReadUpdateOnly: [ROLES.HR_PAYROLL_USER] },
  payslips: {
    fullCrud: [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN],
    createReadUpdateOnly: [ROLES.HR_PAYROLL_USER],
    readOwnOnly: [ROLES.EMPLOYEE],
  },
  payrollDashboard: { readOnly: PAYROLL_ROLES.concat(ROLES.HR_MANAGER) },
  userManagement: { fullCrud: [ROLES.ADMIN] },
}

export function isValidRole(role) {
  return ALL_ROLES.includes(role)
}
