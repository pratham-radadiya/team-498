import { checkInSchema, checkOutSchema, updateAttendanceSchema, attendanceListRequestSchema } from '../validators/attendance.validator'
import * as attendanceService from '../services/attendance.service'

export async function getCurrentAttendanceController(request, session) {
  const url = new URL(request.url)
  const employeeId = url.searchParams.get('employeeId') ?? undefined
  const result = await attendanceService.getCurrentAttendance(session, employeeId)
  return Response.json(result)
}

export async function checkInController(request, session) {
  const body = await request.json().catch(() => ({}))
  const { employeeId } = checkInSchema.parse(body)
  const record = await attendanceService.checkIn(session, employeeId)
  return Response.json(record, { status: 201 })
}

export async function checkOutController(request, session) {
  const body = await request.json().catch(() => ({}))
  const { employeeId } = checkOutSchema.parse(body)
  const record = await attendanceService.checkOut(session, employeeId)
  return Response.json(record)
}

export async function getAttendanceController(id, session) {
  const record = await attendanceService.getAttendance(id, session)
  return Response.json(record)
}

export async function updateAttendanceController(request, id, session) {
  const body = await request.json()
  const data = updateAttendanceSchema.parse(body)
  const record = await attendanceService.updateAttendance(id, data, session)
  return Response.json(record)
}

export async function deleteAttendanceController(id) {
  await attendanceService.deleteAttendance(id)
  return new Response(null, { status: 204 })
}

export async function listAttendanceController(request, session) {
  const body = await request.json()
  const gridRequest = attendanceListRequestSchema.parse(body)
  const result = await attendanceService.listAttendanceGrid(gridRequest, session)
  return Response.json(result)
}
