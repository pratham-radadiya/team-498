import { prisma } from '../lib/prisma'

export function createTimeOffRequest(data) {
  return prisma.timeOffRequest.create({ data })
}

export function findTimeOffRequestById(id) {
  return prisma.timeOffRequest.findUnique({ where: { id } })
}

export function updateTimeOffRequest(id, data) {
  return prisma.timeOffRequest.update({ where: { id }, data })
}

export function deleteTimeOffRequest(id) {
  return prisma.timeOffRequest.delete({ where: { id } })
}

export function listTimeOffRequestsForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.timeOffRequest.findMany({ skip, take, orderBy, where }),
    prisma.timeOffRequest.count({ where }),
  ])
}

// Approve-time balance decrement and status change happen atomically —
// either both happen or neither does.
export function approveInTransaction({ requestId, allocationId, duration, approverId }) {
  return prisma.$transaction(async (tx) => {
    const request = await tx.timeOffRequest.update({
      where: { id: requestId },
      data: { status: 'Approved', approverId },
    })
    if (allocationId) {
      await tx.allocation.update({
        where: { id: allocationId },
        data: { taken: { increment: duration } },
      })
    }
    return request
  })
}
