import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ConflictError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as attendanceRepo from '../repositories/attendance.repository'
import * as employeeRepo from '../repositories/employee.repository'
import { prisma } from '../lib/prisma'

const FILTER_FIELD_MAP = {
  employeeId: (filter) => ({ employeeId: { equals: filter.filter } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

const JS_DAY_TO_WEEK_DAY = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

// Resolves the employee's expected hours for the weekday `checkIn` falls on,
// from their assigned WorkingSchedule. Falls back to `workedHours` itself
// (i.e. zero measurable overtime) when there's no schedule or no matching day
// — we can't call hours "overtime" against an expectation we don't have.
async function resolveExpectedHours(employeeId, checkInDate, workedHours) {
  const employee = await employeeRepo.findEmployeeById(employeeId)
  if (!employee?.workingScheduleId) return workedHours

  const weekDay = JS_DAY_TO_WEEK_DAY[checkInDate.getUTCDay()]
  const dayEntry = await prisma.workingScheduleDay.findFirst({
    where: { workingScheduleId: employee.workingScheduleId, day: weekDay },
  })
  return dayEntry ? dayEntry.hours : workedHours
}

async function computeHoursAndOvertime(employeeId, checkIn, checkOut) {
  const workedHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
  const expectedHours = await resolveExpectedHours(employeeId, checkIn, workedHours)
  const overtime = Math.max(0, workedHours - expectedHours)
  return { workedHours, overtime }
}

function resolveTargetEmployeeId(session, requestedEmployeeId) {
  if (session.role === ROLES.EMPLOYEE) return session.employeeId
  return requestedEmployeeId ?? session.employeeId
}

// Powers the quick check-in/check-out widget's "auto-detect open session"
// behavior — deferred in Phase 3, completed now. `isOpen: false` means the
// widget should show "Check In"; `true` means "Check Out" + elapsed time
// (computed client-side from `checkIn`, this endpoint doesn't recompute it).
export async function getCurrentAttendance(session, requestedEmployeeId) {
  const employeeId = resolveTargetEmployeeId(session, requestedEmployeeId)
  if (!employeeId) return { isOpen: false, attendance: null }
  const open = await attendanceRepo.findOpenAttendance(employeeId)
  return { isOpen: Boolean(open), attendance: open }
}

export async function checkIn(session, requestedEmployeeId) {
  const employeeId = resolveTargetEmployeeId(session, requestedEmployeeId)
  if (!employeeId) throw new ConflictError('No employee record to check in for')

  const open = await attendanceRepo.findOpenAttendance(employeeId)
  if (open) throw new ConflictError('Already checked in — check out first')

  return attendanceRepo.createAttendance({
    employeeId,
    checkIn: new Date(),
    status: 'Present',
  })
}

export async function checkOut(session, requestedEmployeeId) {
  const employeeId = resolveTargetEmployeeId(session, requestedEmployeeId)
  if (!employeeId) throw new ConflictError('No employee record to check out for')

  const open = await attendanceRepo.findOpenAttendance(employeeId)
  if (!open) throw new ConflictError('No active check-in session found')

  const checkOutTime = new Date()
  const { workedHours, overtime } = await computeHoursAndOvertime(employeeId, open.checkIn, checkOutTime)

  return attendanceRepo.updateAttendance(open.id, { checkOut: checkOutTime, workedHours, overtime })
}

export async function getAttendance(id, session) {
  const attendance = await attendanceRepo.findAttendanceById(id)
  if (!attendance) throw new NotFoundError('Attendance record not found')
  if (session.role === ROLES.EMPLOYEE && attendance.employeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own attendance records')
  }
  return attendance
}

// Manual correction (HR Manager and above only, enforced at the route). If
// checkIn/checkOut change, workedHours/overtime are recomputed — a correction
// can never leave stale derived numbers behind.
export async function updateAttendance(id, data, session) {
  const existing = await attendanceRepo.findAttendanceById(id)
  if (!existing) throw new NotFoundError('Attendance record not found')

  const payload = { ...data, correctedBy: session.employeeId }
  if (data.checkIn) payload.checkIn = new Date(data.checkIn)
  if ('checkOut' in data) payload.checkOut = data.checkOut ? new Date(data.checkOut) : null

  const finalCheckIn = payload.checkIn ?? existing.checkIn
  const finalCheckOut = 'checkOut' in payload ? payload.checkOut : existing.checkOut

  if (finalCheckOut) {
    const { workedHours, overtime } = await computeHoursAndOvertime(existing.employeeId, finalCheckIn, finalCheckOut)
    payload.workedHours = workedHours
    payload.overtime = overtime
  }

  return attendanceRepo.updateAttendance(id, payload)
}

export async function deleteAttendance(id) {
  const existing = await attendanceRepo.findAttendanceById(id)
  if (!existing) throw new NotFoundError('Attendance record not found')
  return attendanceRepo.deleteAttendance(id)
}

export async function listAttendanceGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  const effectiveWhere =
    session.role === ROLES.EMPLOYEE ? { ...where, employeeId: session.employeeId } : where

  const [rows, rowCount] = await attendanceRepo.listAttendanceForGrid({
    skip,
    take,
    orderBy,
    where: effectiveWhere,
  })
  return { rows, rowCount }
}
