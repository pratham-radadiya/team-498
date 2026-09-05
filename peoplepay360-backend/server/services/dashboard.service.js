import * as dashboardRepo from '../repositories/dashboard.repository'

// Resolves the {department, employeeType, company} filter into an Employee
// where-clause usable as a nested relation filter from any related model
// (Payslip.employee, Attendance.employee, TimeOffRequest.employee, ...).
// employeeType is a SalaryStructure id, matched against the employee's
// current Running contract — see dashboard.validator.js for why.
function buildEmployeeWhere({ department, employeeType, company }) {
  const where = {}
  if (department) where.department = department
  if (company) where.company = company
  if (employeeType) where.contracts = { some: { status: 'Running', salaryStructureId: employeeType } }
  return where
}

// periodStart/periodEnd filter by a simple "starts within range" check on
// the given date field, not full interval overlap — good enough for a
// dashboard filter, not a booking/scheduling conflict check.
function buildDateRangeWhere(field, { periodStart, periodEnd }) {
  if (!periodStart && !periodEnd) return {}
  const range = {}
  if (periodStart) range.gte = new Date(periodStart)
  if (periodEnd) range.lte = new Date(periodEnd)
  return { [field]: range }
}

export async function getKpis(filters) {
  const where = {
    employee: buildEmployeeWhere(filters),
    payrun: buildDateRangeWhere('periodStart', filters),
  }

  const [totals, byStatus] = await Promise.all([
    dashboardRepo.aggregatePayslips(where),
    dashboardRepo.groupPayslipsByStatus(where),
  ])

  return {
    totalNetSalary: totals._sum.net ?? 0,
    payslipCount: totals._count._all,
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all, netSalary: s._sum.net ?? 0 })),
  }
}

export async function getSalaryByDepartment(filters) {
  const where = {
    employee: buildEmployeeWhere(filters),
    payrun: buildDateRangeWhere('periodStart', filters),
  }
  const rows = await dashboardRepo.findPayslipsForDepartmentBreakdown(where)

  const byDepartment = {}
  for (const row of rows) {
    const dept = row.employee?.department || 'Unassigned'
    byDepartment[dept] ??= { department: dept, totalNetSalary: 0, payslipCount: 0 }
    byDepartment[dept].totalNetSalary += row.net ?? 0
    byDepartment[dept].payslipCount += 1
  }
  return Object.values(byDepartment)
}

export async function getSalaryTrend(filters) {
  const where = {
    employee: buildEmployeeWhere(filters),
    payrun: buildDateRangeWhere('periodStart', filters),
  }
  const rows = await dashboardRepo.findPayslipsForTrend(where)

  const byMonth = {}
  for (const row of rows) {
    const d = row.payrun?.periodStart
    if (!d) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    byMonth[key] ??= { month: key, totalNetSalary: 0, payslipCount: 0 }
    byMonth[key].totalNetSalary += row.net ?? 0
    byMonth[key].payslipCount += 1
  }
  return Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month))
}

export async function getAttendanceOverview(filters) {
  const where = {
    employee: buildEmployeeWhere(filters),
    ...buildDateRangeWhere('checkIn', filters),
  }

  const [byStatus, missingCheckouts] = await Promise.all([
    dashboardRepo.groupAttendanceByStatus(where),
    dashboardRepo.countMissingCheckouts(where),
  ])

  return {
    byStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all, overtimeHours: s._sum.overtime ?? 0 })),
    missingCheckouts,
  }
}

export async function getTimeOffOverview(filters) {
  const employeeWhere = buildEmployeeWhere(filters)
  const requestWhere = {
    employee: employeeWhere,
    ...buildDateRangeWhere('startDate', filters),
  }

  const [byStatus, allocations] = await Promise.all([
    dashboardRepo.groupTimeOffRequestsByStatus(requestWhere),
    dashboardRepo.findAllocationsForTypeBreakdown({ employee: employeeWhere }),
  ])

  const byType = {}
  for (const a of allocations) {
    const name = a.type?.name || 'Unknown'
    byType[name] ??= { type: name, allocated: 0, taken: 0 }
    byType[name].allocated += a.allocated
    byType[name].taken += a.taken
  }

  return {
    requestsByStatus: byStatus.map((s) => ({ status: s.status, count: s._count._all, days: s._sum.duration ?? 0 })),
    remainingByType: Object.values(byType).map((t) => ({ ...t, remaining: t.allocated - t.taken })),
  }
}

export async function getDepartmentOverview(filters) {
  const employees = await dashboardRepo.findEmployeesForDepartmentOverview(buildEmployeeWhere(filters))

  const byDepartment = {}
  for (const emp of employees) {
    const dept = emp.department || 'Unassigned'
    byDepartment[dept] ??= { department: dept, headcount: 0, totalWage: 0, employeesWithContract: 0 }
    byDepartment[dept].headcount += 1
    const wage = emp.contracts?.[0]?.wage
    if (wage != null) {
      byDepartment[dept].totalWage += wage
      byDepartment[dept].employeesWithContract += 1
    }
  }

  return Object.values(byDepartment).map(({ employeesWithContract, totalWage, ...rest }) => ({
    ...rest,
    avgWage: employeesWithContract > 0 ? totalWage / employeesWithContract : 0,
  }))
}
