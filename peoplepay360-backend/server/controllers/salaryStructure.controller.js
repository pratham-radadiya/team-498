import { createSalaryStructureSchema, updateSalaryStructureSchema, salaryStructureListRequestSchema } from '../validators/salaryStructure.validator'
import * as salaryStructureService from '../services/salaryStructure.service'

export async function createSalaryStructureController(request) {
  const body = await request.json()
  const data = createSalaryStructureSchema.parse(body)
  const structure = await salaryStructureService.createSalaryStructure(data)
  return Response.json(structure, { status: 201 })
}

export async function getSalaryStructureController(id) {
  const structure = await salaryStructureService.getSalaryStructure(id)
  return Response.json(structure)
}

export async function updateSalaryStructureController(request, id) {
  const body = await request.json()
  const data = updateSalaryStructureSchema.parse(body)
  const structure = await salaryStructureService.updateSalaryStructure(id, data)
  return Response.json(structure)
}

export async function deleteSalaryStructureController(id) {
  await salaryStructureService.deleteSalaryStructure(id)
  return new Response(null, { status: 204 })
}

export async function listSalaryStructuresController(request) {
  const body = await request.json()
  const gridRequest = salaryStructureListRequestSchema.parse(body)
  const result = await salaryStructureService.listSalaryStructuresGrid(gridRequest)
  return Response.json(result)
}

export async function listSalaryStructureOptionsController() {
  const options = await salaryStructureService.listSalaryStructureOptions()
  return Response.json(options.map((s) => ({ id: s.id, label: s.name })))
}
