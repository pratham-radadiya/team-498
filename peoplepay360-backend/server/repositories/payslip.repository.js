import { prisma } from '../lib/prisma'

export function findPayslipById(id) {
  return prisma.payslip.findUnique({
    where: { id },
    include: { warnings: true, employee: true, payrun: true, contract: true },
  })
}

export function updatePayslipComputation(id, { contractId, workedDays, basic, gross, net, lines, status }) {
  return prisma.payslip.update({
    where: { id },
    data: { contractId, workedDays, basic, gross, net, lines, status },
  })
}

export function replaceWarnings(payslipId, warnings) {
  return prisma.$transaction([
    prisma.payslipWarning.deleteMany({ where: { payslipId } }),
    ...(warnings.length > 0
      ? [prisma.payslipWarning.createMany({ data: warnings.map((w) => ({ payslipId, ...w })) })]
      : []),
  ])
}

export function deletePayslip(id) {
  return prisma.payslip.delete({ where: { id } })
}

export function listPayslipsForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.payslip.findMany({ skip, take, orderBy, where, include: { warnings: true } }),
    prisma.payslip.count({ where }),
  ])
}

// Payslips for the same employee in a *different, already Validated/Paid*
// Payrun whose period overlaps this one — powers the "duplicate" warning.
export function findOverlappingFinalizedPayslips(employeeId, periodStart, periodEnd, excludePayrunId) {
  return prisma.payslip.findMany({
    where: {
      employeeId,
      payrunId: { not: excludePayrunId },
      payrun: {
        status: { in: ['Validated', 'Paid'] },
        periodStart: { lte: periodEnd },
        periodEnd: { gte: periodStart },
      },
    },
  })
}
