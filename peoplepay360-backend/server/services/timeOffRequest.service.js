import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ConflictError, ValidationError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as timeOffRequestRepo from '../repositories/timeOffRequest.repository'
import * as timeOffTypeRepo from '../repositories/timeOffType.repository'
import * as allocationRepo from '../repositories/allocation.repository'

const FILTER_FIELD_MAP = {
  employeeId: (filter) => ({ employeeId: { equals: filter.filter } }),
  typeId: (filter) => ({ typeId: { equals: filter.filter } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

function inclusiveDayCount(startDate, endDate) {
  const oneDayMs = 1000 * 60 * 60 * 24
  return Math.round((endDate.getTime() - startDate.getTime()) / oneDayMs) + 1
}

// Finds one Approved allocation for this employee+type with enough remaining
// balance to cover `duration`. A request maps to exactly one allocation (per
// the mockup's "Allocation Used" field) — balance is never summed across
// multiple allocations.
async function findAllocationWithSufficientBalance(employeeId, typeId, duration) {
  const candidates = await allocationRepo.findApprovedAllocations(employeeId, typeId)
  return candidates.find((a) => a.allocated - a.taken >= duration) ?? null
}

export async function createTimeOffRequest(data, session) {
  const employeeId = session.role === ROLES.EMPLOYEE ? session.employeeId : (data.employeeId ?? session.employeeId)
  if (!employeeId) throw new ValidationError('employeeId is required')

  const type = await timeOffTypeRepo.findTimeOffTypeById(data.typeId)
  if (!type) throw new NotFoundError('Time off type not found')

  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  if (endDate < startDate) throw new ValidationError('endDate must be on or after startDate')
  const duration = inclusiveDayCount(startDate, endDate)

  let allocation = null
  if (type.requiresAllocation) {
    allocation = await findAllocationWithSufficientBalance(employeeId, data.typeId, duration)
    if (!allocation) {
      throw new ConflictError(
        `${type.name} requires an approved allocation with at least ${duration} remaining, and none was found for this employee`
      )
    }
  }

  return timeOffRequestRepo.createTimeOffRequest({
    employeeId,
    typeId: data.typeId,
    startDate,
    endDate,
    duration,
    allocationId: allocation?.id ?? null,
    reason: data.reason,
  })
}

export async function getTimeOffRequest(id, session) {
  const request = await timeOffRequestRepo.findTimeOffRequestById(id)
  if (!request) throw new NotFoundError('Time off request not found')
  if (session.role === ROLES.EMPLOYEE && request.employeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own time off requests')
  }
  return request
}

export async function approveTimeOffRequest(id, session) {
  const request = await timeOffRequestRepo.findTimeOffRequestById(id)
  if (!request) throw new NotFoundError('Time off request not found')
  if (request.status !== 'Pending') {
    throw new ConflictError('Only a Pending request can be approved')
  }

  // Re-check balance at approval time too, in case it changed since submission.
  if (request.allocationId) {
    const allocation = await allocationRepo.findAllocationById(request.allocationId)
    if (!allocation || allocation.allocated - allocation.taken < request.duration) {
      throw new ConflictError('The matched allocation no longer has sufficient remaining balance')
    }
  }

  return timeOffRequestRepo.approveInTransaction({
    requestId: id,
    allocationId: request.allocationId,
    duration: request.duration,
    approverId: session.userId,
  })
}

export async function refuseTimeOffRequest(id, session) {
  const request = await timeOffRequestRepo.findTimeOffRequestById(id)
  if (!request) throw new NotFoundError('Time off request not found')
  if (request.status !== 'Pending') {
    throw new ConflictError('Only a Pending request can be refused')
  }
  return timeOffRequestRepo.updateTimeOffRequest(id, { status: 'Refused', approverId: session.userId })
}

export async function deleteTimeOffRequest(id) {
  const existing = await timeOffRequestRepo.findTimeOffRequestById(id)
  if (!existing) throw new NotFoundError('Time off request not found')
  return timeOffRequestRepo.deleteTimeOffRequest(id)
}

export async function listTimeOffRequestsGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  const effectiveWhere =
    session.role === ROLES.EMPLOYEE ? { ...where, employeeId: session.employeeId } : where

  const [rows, rowCount] = await timeOffRequestRepo.listTimeOffRequestsForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows, rowCount }
}
