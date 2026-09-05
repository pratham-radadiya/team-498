import { createTimeOffRequestSchema, timeOffRequestListRequestSchema } from '../validators/timeOffRequest.validator'
import * as timeOffRequestService from '../services/timeOffRequest.service'

export async function createTimeOffRequestController(request, session) {
  const body = await request.json()
  const data = createTimeOffRequestSchema.parse(body)
  const record = await timeOffRequestService.createTimeOffRequest(data, session)
  return Response.json(record, { status: 201 })
}

export async function getTimeOffRequestController(id, session) {
  const record = await timeOffRequestService.getTimeOffRequest(id, session)
  return Response.json(record)
}

export async function approveTimeOffRequestController(id, session) {
  const record = await timeOffRequestService.approveTimeOffRequest(id, session)
  return Response.json(record)
}

export async function refuseTimeOffRequestController(id, session) {
  const record = await timeOffRequestService.refuseTimeOffRequest(id, session)
  return Response.json(record)
}

export async function deleteTimeOffRequestController(id) {
  await timeOffRequestService.deleteTimeOffRequest(id)
  return new Response(null, { status: 204 })
}

export async function listTimeOffRequestsController(request, session) {
  const body = await request.json()
  const gridRequest = timeOffRequestListRequestSchema.parse(body)
  const result = await timeOffRequestService.listTimeOffRequestsGrid(gridRequest, session)
  return Response.json(result)
}
