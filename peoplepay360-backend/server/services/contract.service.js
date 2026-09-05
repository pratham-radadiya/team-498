import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ConflictError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as contractRepo from '../repositories/contract.repository'

const FILTER_FIELD_MAP = {
  status: (filter) => ({ status: { equals: filter.filter } }),
  employeeId: (filter) => ({ employeeId: { equals: filter.filter } }),
}

async function assertNoOverlap({ employeeId, startDate, endDate, status, excludeId }) {
  if (status && status !== 'Running') return
  const overlapping = await contractRepo.findOverlappingRunningContracts({
    employeeId,
    startDate: new Date(startDate),
    endDate: endDate ? new Date(endDate) : null,
    excludeId,
  })
  if (overlapping.length > 0) {
    throw new ConflictError(
      'This employee already has a Running contract that overlaps this period. Only one Running contract per period is allowed.'
    )
  }
}

// Zod validates startDate/endDate as plain "YYYY-MM-DD" strings (client-friendly),
// but Prisma's DateTime column needs a real Date/full ISO datetime — converted here,
// once, before anything touches the repository.
function withDateObjects(data) {
  return {
    ...data,
    ...(data.startDate ? { startDate: new Date(data.startDate) } : {}),
    ...('endDate' in data ? { endDate: data.endDate ? new Date(data.endDate) : null } : {}),
  }
}

export async function createContract(rawData) {
  const data = withDateObjects(rawData)
  await assertNoOverlap({
    employeeId: data.employeeId,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status ?? 'Running',
  })
  return contractRepo.createContract(data)
}

export async function updateContract(id, rawData) {
  const existing = await contractRepo.findContractById(id)
  if (!existing) throw new NotFoundError('Contract not found')

  const data = withDateObjects(rawData)
  const merged = { ...existing, ...data }
  await assertNoOverlap({
    employeeId: merged.employeeId,
    startDate: merged.startDate,
    endDate: merged.endDate,
    status: merged.status,
    excludeId: id,
  })
  return contractRepo.updateContract(id, data)
}

export async function getContract(id, session) {
  const contract = await contractRepo.findContractById(id)
  if (!contract) throw new NotFoundError('Contract not found')
  if (session.role === ROLES.EMPLOYEE && contract.employeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own contracts')
  }
  return contract
}

export async function deleteContract(id) {
  const existing = await contractRepo.findContractById(id)
  if (!existing) throw new NotFoundError('Contract not found')
  return contractRepo.deleteContract(id)
}

export async function listContractsGrid(gridRequest, session, { forcedEmployeeId } = {}) {
  if (forcedEmployeeId && session.role === ROLES.EMPLOYEE && forcedEmployeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own contracts')
  }

  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  let effectiveWhere = where
  if (session.role === ROLES.EMPLOYEE) {
    effectiveWhere = { ...where, employeeId: session.employeeId }
  }
  if (forcedEmployeeId) {
    effectiveWhere = { ...effectiveWhere, employeeId: forcedEmployeeId }
  }

  const [rows, rowCount] = await contractRepo.listContractsForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows, rowCount }
}
