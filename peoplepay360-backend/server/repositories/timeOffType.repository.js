import { prisma } from '../lib/prisma'

export function createTimeOffType(data) {
  return prisma.timeOffType.create({ data })
}

export function findTimeOffTypeById(id) {
  return prisma.timeOffType.findUnique({ where: { id } })
}

export function updateTimeOffType(id, data) {
  return prisma.timeOffType.update({ where: { id }, data })
}

export function deleteTimeOffType(id) {
  return prisma.timeOffType.delete({ where: { id } })
}

export function listTimeOffTypesForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.timeOffType.findMany({ skip, take, orderBy, where }),
    prisma.timeOffType.count({ where }),
  ])
}

export function listTimeOffTypeOptions() {
  return prisma.timeOffType.findMany({
    where: { status: 'Active' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
