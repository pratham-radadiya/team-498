import { createAllocationSchema, updateAllocationSchema, allocationListRequestSchema } from '../validators/allocation.validator'
import * as allocationService from '../services/allocation.service'

export async function createAllocationController(request) {
  const body = await request.json()
  const data = createAllocationSchema.parse(body)
  const allocation = await allocationService.createAllocation(data)
  return Response.json(allocation, { status: 201 })
}

export async function getAllocationController(id, session) {
  const allocation = await allocationService.getAllocation(id, session)
  return Response.json(allocation)
}

export async function updateAllocationController(request, id) {
  const body = await request.json()
  const data = updateAllocationSchema.parse(body)
  const allocation = await allocationService.updateAllocation(id, data)
  return Response.json(allocation)
}

export async function deleteAllocationController(id) {
  await allocationService.deleteAllocation(id)
  return new Response(null, { status: 204 })
}

export async function listAllocationsController(request, session) {
  const body = await request.json().catch(() => ({}))
  const gridRequest = allocationListRequestSchema.parse(body)
  const result = await allocationService.listAllocationsGrid(gridRequest, session)
  return Response.json(result)
}
