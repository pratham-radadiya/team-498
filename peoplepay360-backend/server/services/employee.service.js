import bcrypt from 'bcryptjs'
import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { ConflictError, NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as employeeRepo from '../repositories/employee.repository'

const FILTER_FIELD_MAP = {
  name: (filter) => ({ name: { contains: filter.filter, mode: 'insensitive' } }),
  department: (filter) => ({ department: { equals: filter.filter } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

export async function createEmployee(data) {
  const existing = await employeeRepo.findEmployeeByEmail(data.email)
  if (existing) throw new ConflictError('An employee with this email already exists')

  const { password, ...rest } = data
  const passwordHash = await bcrypt.hash(password, 10)
  return employeeRepo.createEmployee({ ...rest, passwordHash })
}

// EMPLOYEE role may only read their own record — never trusts the requested
// id for that role, always resolves against session.employeeId instead.
export async function getEmployee(id, session) {
  const targetId = session.role === ROLES.EMPLOYEE ? session.employeeId : id
  if (session.role === ROLES.EMPLOYEE && id !== session.employeeId) {
    throw new ForbiddenError('You may only view your own employee record')
  }
  const employee = await employeeRepo.findEmployeeByIdWithCounts(targetId)
  if (!employee) throw new NotFoundError('Employee not found')

  const { _count, ...rest } = employee
  return {
    ...rest,
    smartButtonCounts: {
      contracts: _count.contracts,
      attendance: _count.attendances,
      timeOff: _count.timeOffRequests,
      allocations: _count.allocations,
    },
  }
}

// A person can never change their own role, and only Admin may change
// anyone's role — mirrors the old User-module rule, now enforced here since
// role lives on Employee.
export async function updateEmployee(id, data, session) {
  const employee = await employeeRepo.findEmployeeById(id)
  if (!employee) throw new NotFoundError('Employee not found')

  if ('role' in data) {
    if (id === session.employeeId) throw new ForbiddenError('You cannot change your own role')
    if (session.role !== ROLES.ADMIN) throw new ForbiddenError('Only Admin can change a role')
  }

  return employeeRepo.updateEmployee(id, data)
}

export async function deleteEmployee(id) {
  const employee = await employeeRepo.findEmployeeById(id)
  if (!employee) throw new NotFoundError('Employee not found')
  return employeeRepo.deleteEmployee(id)
}

// EMPLOYEE role's grid is forced to their own record only, regardless of any
// filterModel the client sends.
export async function listEmployeesGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  const effectiveWhere =
    session.role === ROLES.EMPLOYEE ? { ...where, id: session.employeeId } : where

  const [rows, rowCount] = await employeeRepo.listEmployeesForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows, rowCount }
}

export async function listEmployeeOptions() {
  return employeeRepo.listEmployeeOptions()
}
