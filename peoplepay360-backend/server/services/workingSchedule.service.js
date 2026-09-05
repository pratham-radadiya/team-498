import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ValidationError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as workingScheduleRepo from '../repositories/workingSchedule.repository'
import * as employeeRepo from '../repositories/employee.repository'

const FILTER_FIELD_MAP = {
  name: (filter) => ({ name: { contains: filter.filter, mode: 'insensitive' } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

// Server-computed: never trust a client-supplied totalWeeklyHours or per-day hours.
// Same-day shifts only (endTime must be after startTime) — overnight shifts are
// out of scope for this schedule model, per the plan's "open to the team" note.
export function computeScheduleHours(days) {
  const daysWithHours = days.map((d) => {
    const minutes = toMinutes(d.endTime) - toMinutes(d.startTime) - (d.breakMinutes ?? 0)
    if (minutes <= 0) {
      throw new ValidationError(`Invalid day entry for ${d.day}: endTime must be after startTime + break`)
    }
    return { ...d, hours: minutes / 60 }
  })
  const totalWeeklyHours = daysWithHours.reduce((sum, d) => sum + d.hours, 0)
  return { daysWithHours, totalWeeklyHours }
}

export async function createWorkingSchedule(data) {
  const { daysWithHours, totalWeeklyHours } = computeScheduleHours(data.days)
  return workingScheduleRepo.createWorkingSchedule({
    ...data,
    days: daysWithHours,
    totalWeeklyHours,
  })
}

export async function updateWorkingSchedule(id, data) {
  const existing = await workingScheduleRepo.findWorkingScheduleById(id)
  if (!existing) throw new NotFoundError('Working schedule not found')

  const payload = { ...data }
  if (data.days) {
    const { daysWithHours, totalWeeklyHours } = computeScheduleHours(data.days)
    payload.days = daysWithHours
    payload.totalWeeklyHours = totalWeeklyHours
  }
  return workingScheduleRepo.replaceWorkingSchedule(id, payload)
}

async function resolveOwnScheduleId(session) {
  const employee = await employeeRepo.findEmployeeById(session.employeeId)
  return employee?.workingScheduleId ?? null
}

export async function getWorkingSchedule(id, session) {
  if (session.role === ROLES.EMPLOYEE) {
    const ownScheduleId = await resolveOwnScheduleId(session)
    if (id !== ownScheduleId) {
      throw new ForbiddenError('You may only view your own assigned working schedule')
    }
  }
  const schedule = await workingScheduleRepo.findWorkingScheduleById(id)
  if (!schedule) throw new NotFoundError('Working schedule not found')
  return schedule
}

export async function deleteWorkingSchedule(id) {
  const existing = await workingScheduleRepo.findWorkingScheduleById(id)
  if (!existing) throw new NotFoundError('Working schedule not found')
  return workingScheduleRepo.deleteWorkingSchedule(id)
}

export async function listWorkingSchedulesGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  let effectiveWhere = where
  if (session.role === ROLES.EMPLOYEE) {
    const ownScheduleId = await resolveOwnScheduleId(session)
    effectiveWhere = { ...where, id: ownScheduleId ?? '__none__' }
  }

  const [rows, rowCount] = await workingScheduleRepo.listWorkingSchedulesForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows, rowCount }
}

export async function listWorkingScheduleOptions() {
  return workingScheduleRepo.listWorkingScheduleOptions()
}
