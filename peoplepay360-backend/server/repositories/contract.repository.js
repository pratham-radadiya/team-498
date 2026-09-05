import { prisma } from '../lib/prisma'

export function createContract(data) {
  return prisma.contract.create({ data })
}

export function findContractById(id) {
  return prisma.contract.findUnique({ where: { id } })
}

export function updateContract(id, data) {
  return prisma.contract.update({ where: { id }, data })
}

export function deleteContract(id) {
  return prisma.contract.delete({ where: { id } })
}

// Finds Running contracts for an employee whose [startDate, endDate] range
// overlaps the given range. `excludeId` skips the contract being updated.
export function findOverlappingRunningContracts({ employeeId, startDate, endDate, excludeId }) {
  return prisma.contract.findMany({
    where: {
      employeeId,
      status: 'Running',
      id: excludeId ? { not: excludeId } : undefined,
      startDate: endDate ? { lte: endDate } : undefined,
      OR: [{ endDate: null }, { endDate: { gte: startDate } }],
    },
  })
}

export function listContractsForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.contract.findMany({ skip, take, orderBy, where }),
    prisma.contract.count({ where }),
  ])
}
