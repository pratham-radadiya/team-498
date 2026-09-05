import { createContractSchema, updateContractSchema, contractListRequestSchema } from '../validators/contract.validator'
import * as contractService from '../services/contract.service'

export async function createContractController(request) {
  const body = await request.json()
  const data = createContractSchema.parse(body)
  const contract = await contractService.createContract(data)
  return Response.json(contract, { status: 201 })
}

export async function getContractController(id, session) {
  const contract = await contractService.getContract(id, session)
  return Response.json(contract)
}

export async function updateContractController(request, id) {
  const body = await request.json()
  const data = updateContractSchema.parse(body)
  const contract = await contractService.updateContract(id, data)
  return Response.json(contract)
}

export async function deleteContractController(id) {
  await contractService.deleteContract(id)
  return new Response(null, { status: 204 })
}

export async function listContractsController(request, session, options) {
  const body = await request.json()
  const gridRequest = contractListRequestSchema.parse(body)
  const result = await contractService.listContractsGrid(gridRequest, session, options)
  return Response.json(result)
}
