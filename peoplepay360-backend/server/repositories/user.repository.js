import { prisma } from '../lib/prisma'

export function createUser(data) {
  return prisma.user.create({ data })
}

export function findUserById(id) {
  return prisma.user.findUnique({ where: { id } })
}

export function findUserByEmployeeId(employeeId) {
  return prisma.user.findUnique({ where: { employeeId } })
}

export function updateUser(id, data) {
  return prisma.user.update({ where: { id }, data })
}

export function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, role: true, status: true, employeeId: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
}
