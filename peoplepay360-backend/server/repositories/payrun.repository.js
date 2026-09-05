import { prisma } from '../lib/prisma'
import { EMPLOYEE_SAFE_SELECT } from './employee.repository'

export function createPayrunWithDraftPayslips({ name, structureId, periodStart, periodEnd, employeeIds }) {
  return prisma.payrun.create({
    data: {
      name,
      structureId,
      periodStart,
      periodEnd,
      status: 'Draft',
      payslips: {
        create: employeeIds.map((employeeId) => ({ employeeId, status: 'Draft' })),
      },
    },
    include: { payslips: true },
  })
}

export function findPayrunById(id) {
  return prisma.payrun.findUnique({
    where: { id },
    include: { payslips: { include: { warnings: true } }, structure: true },
  })
}

export function updatePayrunStatus(id, status) {
  return prisma.payrun.update({ where: { id }, data: { status } })
}

export function deletePayrun(id) {
  return prisma.payrun.delete({ where: { id } })
}

export function listPayrunsForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.payrun.findMany({
      skip,
      take,
      orderBy,
      where,
      include: { _count: { select: { payslips: true } } },
    }),
    prisma.payrun.count({ where }),
  ])
}

// Employees with a Running contract overlapping the given period — the
// wizard's step-2 eligible-staff list.
export function findEligibleEmployees(periodStart, periodEnd) {
  return prisma.employee.findMany({
    where: {
      contracts: {
        some: {
          status: 'Running',
          startDate: { lte: periodEnd },
          OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
        },
      },
    },
    select: {
      ...EMPLOYEE_SAFE_SELECT,
      contracts: {
        where: {
          status: 'Running',
          startDate: { lte: periodEnd },
          OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
        },
        include: { workingSchedule: true },
      },
    },
  })
}
