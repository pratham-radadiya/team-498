import { prisma } from '../lib/prisma'

export function createWorkingSchedule({ days, ...data }) {
  return prisma.workingSchedule.create({
    data: { ...data, days: { create: days } },
    include: { days: true },
  })
}

export function findWorkingScheduleById(id) {
  return prisma.workingSchedule.findUnique({ where: { id }, include: { days: true } })
}

export async function replaceWorkingSchedule(id, { days, ...data }) {
  return prisma.$transaction(async (tx) => {
    if (days) {
      await tx.workingScheduleDay.deleteMany({ where: { workingScheduleId: id } })
    }
    return tx.workingSchedule.update({
      where: { id },
      data: { ...data, ...(days ? { days: { create: days } } : {}) },
      include: { days: true },
    })
  })
}

export function deleteWorkingSchedule(id) {
  return prisma.workingSchedule.delete({ where: { id } })
}

export function listWorkingSchedulesForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.workingSchedule.findMany({ skip, take, orderBy, where }),
    prisma.workingSchedule.count({ where }),
  ])
}

export function listWorkingScheduleOptions() {
  return prisma.workingSchedule.findMany({
    where: { status: 'Active' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
