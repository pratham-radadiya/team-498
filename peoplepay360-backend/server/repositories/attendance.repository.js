import { prisma } from '../lib/prisma'

export function createAttendance(data) {
  return prisma.attendance.create({ data })
}

export function findAttendanceById(id) {
  return prisma.attendance.findUnique({ where: { id } })
}

export function findOpenAttendance(employeeId) {
  return prisma.attendance.findFirst({
    where: { employeeId, checkOut: null },
    orderBy: { checkIn: 'desc' },
  })
}

export function updateAttendance(id, data) {
  return prisma.attendance.update({ where: { id }, data })
}

export function deleteAttendance(id) {
  return prisma.attendance.delete({ where: { id } })
}

export function listAttendanceForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.attendance.findMany({ skip, take, orderBy, where, include: { employee: { select: { name: true } } } }),
    prisma.attendance.count({ where }),
  ])
}
