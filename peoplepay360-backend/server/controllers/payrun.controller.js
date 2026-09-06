import { createPayrunSchema, eligibleEmployeesSchema, payrunListRequestSchema } from '../validators/payrun.validator'
import * as payrunService from '../services/payrun.service'

export async function createPayrunController(request) {
  const body = await request.json()
  const data = createPayrunSchema.parse(body)
  const payrun = await payrunService.createPayrun(data)
  return Response.json(payrun, { status: 201 })
}

export async function eligibleEmployeesController(request) {
  const body = await request.json()
  const data = eligibleEmployeesSchema.parse(body)
  const employees = await payrunService.getEligibleEmployees(data)
  return Response.json(employees)
}

export async function getPayrunController(id) {
  const payrun = await payrunService.getPayrun(id)
  return Response.json(payrun)
}

export async function computePayrunController(id) {
  const payrun = await payrunService.computePayrun(id)
  return Response.json(payrun)
}

export async function validatePayrunController(id) {
  const payrun = await payrunService.validatePayrun(id)
  return Response.json(payrun)
}

export async function markPayrunPaidController(id) {
  const payrun = await payrunService.markPayrunPaid(id)
  return Response.json(payrun)
}

export async function sendPayslipsController(id) {
  const result = await payrunService.sendPayslips(id)
  return Response.json(result)
}


export async function deletePayrunController(id, session) {
  await payrunService.deletePayrun(id, session)
  return new Response(null, { status: 204 })
}

export async function listPayrunsController(request) {
  const body = await request.json()
  const gridRequest = payrunListRequestSchema.parse(body)
  const result = await payrunService.listPayrunsGrid(gridRequest)
  return Response.json(result)
}
