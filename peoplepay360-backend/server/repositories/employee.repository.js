import { prisma } from '../lib/prisma'

// Every Employee field except passwordHash (never expose that) — Employee
// is now the login account, so every read of it must go through this.
export const EMPLOYEE_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  status: true,
  role: true,
  department: true,
  jobPosition: true,
  workLocation: true,
  company: true,
  bankAccount: true,
  workingScheduleId: true,
  managerId: true,
  createdAt: true,
  updatedAt: true,
}

export function createEmployee(data) {
  return prisma.employee.create({ data, select: EMPLOYEE_SAFE_SELECT })
}

export function findEmployeeById(id) {
  return prisma.employee.findUnique({
    where: { id },
    select: EMPLOYEE_SAFE_SELECT,
  })
}

// Powers the Employee Form's smart buttons (Contracts/Attendance/Time Off
// counts) — deferred in Phase 1 until these related models existed.
export function findEmployeeByIdWithCounts(id) {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      ...EMPLOYEE_SAFE_SELECT,
      _count: {
        select: { contracts: true, attendances: true, timeOffRequests: true, allocations: true },
      },
    },
  })
}

export function findEmployeeByEmail(email) {
  return prisma.employee.findUnique({ where: { email } })
}

export function updateEmployee(id, data) {
  return prisma.employee.update({ where: { id }, data, select: EMPLOYEE_SAFE_SELECT })
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
      select: EMPLOYEE_SAFE_SELECT,
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
