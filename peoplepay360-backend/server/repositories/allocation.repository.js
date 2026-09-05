import { prisma } from '../lib/prisma'

export function createAllocation(data) {
  return prisma.allocation.create({ data })
}

export function findAllocationById(id) {
  return prisma.allocation.findUnique({ where: { id } })
}

export function updateAllocation(id, data) {
  return prisma.allocation.update({ where: { id }, data })
}

export function deleteAllocation(id) {
  return prisma.allocation.delete({ where: { id } })
}

// Approved allocations for this employee+type, ordered so the soonest-expiring
// (or oldest) balance is offered first — a simple, predictable pick order.
export function findApprovedAllocations(employeeId, typeId) {
  return prisma.allocation.findMany({
    where: { employeeId, typeId, status: 'Approved' },
    orderBy: { createdAt: 'asc' },
  })
}

export function listAllocationsForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.allocation.findMany({ skip, take, orderBy, where, include: { employee: { select: { name: true } }, type: { select: { name: true } } } }),
    prisma.allocation.count({ where }),
  ])
}
