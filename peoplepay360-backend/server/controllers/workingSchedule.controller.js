import {
  createWorkingScheduleSchema,
  updateWorkingScheduleSchema,
  workingScheduleListRequestSchema,
} from '../validators/workingSchedule.validator'
import * as workingScheduleService from '../services/workingSchedule.service'

export async function createWorkingScheduleController(request) {
  const body = await request.json()
  const data = createWorkingScheduleSchema.parse(body)
  const schedule = await workingScheduleService.createWorkingSchedule(data)
  return Response.json(schedule, { status: 201 })
}

export async function getWorkingScheduleController(id, session) {
  const schedule = await workingScheduleService.getWorkingSchedule(id, session)
  return Response.json(schedule)
}

export async function updateWorkingScheduleController(request, id) {
  const body = await request.json()
  const data = updateWorkingScheduleSchema.parse(body)
  const schedule = await workingScheduleService.updateWorkingSchedule(id, data)
  return Response.json(schedule)
}

export async function deleteWorkingScheduleController(id) {
  await workingScheduleService.deleteWorkingSchedule(id)
  return new Response(null, { status: 204 })
}

export async function listWorkingSchedulesController(request, session) {
  const body = await request.json()
  const gridRequest = workingScheduleListRequestSchema.parse(body)
  const result = await workingScheduleService.listWorkingSchedulesGrid(gridRequest, session)
  return Response.json(result)
}

export async function listWorkingScheduleOptionsController() {
  const options = await workingScheduleService.listWorkingScheduleOptions()
  return Response.json(options.map((s) => ({ id: s.id, label: s.name })))
}
