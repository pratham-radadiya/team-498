import { prisma } from '../lib/prisma'

export function createEmployee(data) {
  return prisma.employee.create({ data })
}

export function findEmployeeById(id) {
  return prisma.employee.findUnique({ where: { id } })
}

// Powers the Employee Form's smart buttons (Contracts/Attendance/Time Off
// counts) — deferred in Phase 1 until these related models existed.
export function findEmployeeByIdWithCounts(id) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      _count: {
        select: { contracts: true, attendances: true, timeOffRequests: true, allocations: true },
      },
    },
  })
}

export function updateEmployee(id, data) {
  return prisma.employee.update({ where: { id }, data })
}

export function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } })
}

export function listEmployeesForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.employee.findMany({ skip, take, orderBy, where }),
    prisma.employee.count({ where }),
  ])
}

export function listEmployeeOptions() {
  return prisma.employee.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
