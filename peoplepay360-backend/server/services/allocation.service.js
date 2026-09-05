import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as allocationRepo from '../repositories/allocation.repository'

const FILTER_FIELD_MAP = {
  employeeId: (filter) => ({ employeeId: { equals: filter.filter } }),
  typeId: (filter) => ({ typeId: { equals: filter.filter } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

function withDateObjects(data) {
  return {
    ...data,
    ...(data.validFrom ? { validFrom: new Date(data.validFrom) } : {}),
    ...(data.validTo ? { validTo: new Date(data.validTo) } : {}),
  }
}

// Adds a computed `remaining` field to the response — never persisted, always
// derived from allocated - taken so the two numbers can't drift apart.
function withRemaining(allocation) {
  return { ...allocation, remaining: allocation.allocated - allocation.taken }
}

export async function createAllocation(data) {
  const allocation = await allocationRepo.createAllocation(withDateObjects(data))
  return withRemaining(allocation)
}

export async function getAllocation(id, session) {
  const allocation = await allocationRepo.findAllocationById(id)
  if (!allocation) throw new NotFoundError('Allocation not found')
  if (session.role === ROLES.EMPLOYEE && allocation.employeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own allocations')
  }
  return withRemaining(allocation)
}

export async function updateAllocation(id, data) {
  const existing = await allocationRepo.findAllocationById(id)
  if (!existing) throw new NotFoundError('Allocation not found')
  const allocation = await allocationRepo.updateAllocation(id, withDateObjects(data))
  return withRemaining(allocation)
}

export async function deleteAllocation(id) {
  const existing = await allocationRepo.findAllocationById(id)
  if (!existing) throw new NotFoundError('Allocation not found')
  return allocationRepo.deleteAllocation(id)
}

export async function listAllocationsGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  const effectiveWhere =
    session.role === ROLES.EMPLOYEE ? { ...where, employeeId: session.employeeId } : where

  const [rows, rowCount] = await allocationRepo.listAllocationsForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows: rows.map(withRemaining), rowCount }
}
