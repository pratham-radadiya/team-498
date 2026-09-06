import { prisma } from '../prisma'

// The one Running contract whose period overlaps the given payroll period —
// reuses the same overlap logic Phase 2 uses to prevent concurrent Running
// contracts, so "the applicable contract" and "no two Running contracts can
// overlap" are two views of the same invariant.
export async function resolveApplicableContract(employeeId, periodStart, periodEnd) {
  const candidates = await prisma.contract.findMany({
    where: {
      employeeId,
      status: 'Running',
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    orderBy: { startDate: 'desc' },
  })
  if (candidates.length > 0) return candidates[0]

  return prisma.contract.findFirst({
    where: { employeeId },
    orderBy: { createdAt: 'desc' },
  })
}
