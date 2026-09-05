import { prisma } from '../lib/prisma'

export function aggregatePayslips(where) {
  return prisma.payslip.aggregate({ where, _sum: { net: true }, _count: { _all: true } })
}

export function groupPayslipsByStatus(where) {
  return prisma.payslip.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { net: true } })
}

// Cross-relation breakdowns (by Employee.department, by month) aren't
// expressible in a single Prisma groupBy — fetched flat and reduced in the
// service layer instead.
export function findPayslipsForDepartmentBreakdown(where) {
  return prisma.payslip.findMany({ where, select: { net: true, employee: { select: { department: true } } } })
}

export function findPayslipsForTrend(where) {
  return prisma.payslip.findMany({ where, select: { net: true, payrun: { select: { periodStart: true } } } })
}

export function groupAttendanceByStatus(where) {
  return prisma.attendance.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { overtime: true } })
}

export function countMissingCheckouts(where) {
  return prisma.attendance.count({ where: { ...where, checkOut: null } })
}

export function groupTimeOffRequestsByStatus(where) {
  return prisma.timeOffRequest.groupBy({ by: ['status'], where, _count: { _all: true }, _sum: { duration: true } })
}

export function findAllocationsForTypeBreakdown(where) {
  return prisma.allocation.findMany({ where, select: { allocated: true, taken: true, type: { select: { name: true } } } })
}

export function findEmployeesForDepartmentOverview(where) {
  return prisma.employee.findMany({
    where,
    select: {
      department: true,
      contracts: { where: { status: 'Running' }, select: { wage: true }, take: 1 },
    },
  })
}
