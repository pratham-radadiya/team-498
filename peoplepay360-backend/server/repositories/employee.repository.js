import { prisma } from '../lib/prisma'

// Every real User field except passwordHash (never expose that) — used
// wherever an Employee response includes its linked login account.
const USER_SELECT = { id: true, email: true, role: true, status: true, createdAt: true }

export function createEmployee(data) {
  return prisma.employee.create({ data })
}

export function findEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
    include: { user: { select: USER_SELECT } },
  })
}

// Powers the Employee Form's smart buttons (Contracts/Attendance/Time Off
// counts) — deferred in Phase 1 until these related models existed.
export function findEmployeeByIdWithCounts(id) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: { select: USER_SELECT },
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
    prisma.employee.findMany({
      skip,
      take,
      orderBy,
      where,
      include: { user: { select: USER_SELECT } },
    }),
    prisma.employee.count({ where }),
  ])
}

export function listEmployeeOptions() {
  return prisma.employee.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
