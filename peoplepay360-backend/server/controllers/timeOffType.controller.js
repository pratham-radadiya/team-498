import { createTimeOffTypeSchema, updateTimeOffTypeSchema, timeOffTypeListRequestSchema } from '../validators/timeOffType.validator'
import * as timeOffTypeService from '../services/timeOffType.service'

export async function createTimeOffTypeController(request) {
  const body = await request.json()
  const data = createTimeOffTypeSchema.parse(body)
  const type = await timeOffTypeService.createTimeOffType(data)
  return Response.json(type, { status: 201 })
}

export async function getTimeOffTypeController(id) {
  const type = await timeOffTypeService.getTimeOffType(id)
  return Response.json(type)
}

export async function updateTimeOffTypeController(request, id) {
  const body = await request.json()
  const data = updateTimeOffTypeSchema.parse(body)
  const type = await timeOffTypeService.updateTimeOffType(id, data)
  return Response.json(type)
}

export async function deleteTimeOffTypeController(id) {
  await timeOffTypeService.deleteTimeOffType(id)
  return new Response(null, { status: 204 })
}

export async function listTimeOffTypesController(request) {
  const body = await request.json()
  const gridRequest = timeOffTypeListRequestSchema.parse(body)
  const result = await timeOffTypeService.listTimeOffTypesGrid(gridRequest)
  return Response.json(result)
}

export async function listTimeOffTypeOptionsController() {
  const options = await timeOffTypeService.listTimeOffTypeOptions()
  return Response.json(options.map((t) => ({ id: t.id, label: t.name })))
}
