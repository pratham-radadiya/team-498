import { NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as timeOffTypeRepo from '../repositories/timeOffType.repository'

const FILTER_FIELD_MAP = {
  name: (filter) => ({ name: { contains: filter.filter, mode: 'insensitive' } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

export async function createTimeOffType(data) {
  return timeOffTypeRepo.createTimeOffType(data)
}

export async function getTimeOffType(id) {
  const type = await timeOffTypeRepo.findTimeOffTypeById(id)
  if (!type) throw new NotFoundError('Time off type not found')
  return type
}

export async function updateTimeOffType(id, data) {
  const existing = await timeOffTypeRepo.findTimeOffTypeById(id)
  if (!existing) throw new NotFoundError('Time off type not found')
  return timeOffTypeRepo.updateTimeOffType(id, data)
}

export async function deleteTimeOffType(id) {
  const existing = await timeOffTypeRepo.findTimeOffTypeById(id)
  if (!existing) throw new NotFoundError('Time off type not found')
  return timeOffTypeRepo.deleteTimeOffType(id)
}

export async function listTimeOffTypesGrid(gridRequest) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)
  const [rows, rowCount] = await timeOffTypeRepo.listTimeOffTypesForGrid({ skip, take, orderBy, where })
  return { rows, rowCount }
}

export async function listTimeOffTypeOptions() {
  return timeOffTypeRepo.listTimeOffTypeOptions()
}
