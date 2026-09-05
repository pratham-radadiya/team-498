import { createSalaryRuleSchema, updateSalaryRuleSchema, salaryRuleListRequestSchema } from '../validators/salaryRule.validator'
import * as salaryRuleService from '../services/salaryRule.service'

export async function createSalaryRuleController(request) {
  const body = await request.json()
  const data = createSalaryRuleSchema.parse(body)
  const rule = await salaryRuleService.createSalaryRule(data)
  return Response.json(rule, { status: 201 })
}

export async function getSalaryRuleController(id) {
  const rule = await salaryRuleService.getSalaryRule(id)
  return Response.json(rule)
}

export async function updateSalaryRuleController(request, id) {
  const body = await request.json()
  const data = updateSalaryRuleSchema.parse(body)
  const rule = await salaryRuleService.updateSalaryRule(id, data)
  return Response.json(rule)
}

export async function deleteSalaryRuleController(id) {
  await salaryRuleService.deleteSalaryRule(id)
  return new Response(null, { status: 204 })
}

export async function listSalaryRulesController(request) {
  const body = await request.json().catch(() => ({}))
  const gridRequest = salaryRuleListRequestSchema.parse(body)
  const result = await salaryRuleService.listSalaryRulesGrid(gridRequest)
  return Response.json(result)
}
