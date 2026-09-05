import { NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as salaryRuleRepo from '../repositories/salaryRule.repository'

const FILTER_FIELD_MAP = {
  structureId: (filter) => ({ structureId: { equals: filter.filter } }),
  category: (filter) => ({ category: { equals: filter.filter } }),
}

export async function createSalaryRule(data) {
  return salaryRuleRepo.createSalaryRule(data)
}

export async function getSalaryRule(id) {
  const rule = await salaryRuleRepo.findSalaryRuleById(id)
  if (!rule) throw new NotFoundError('Salary rule not found')
  return rule
}

export async function updateSalaryRule(id, data) {
  const existing = await salaryRuleRepo.findSalaryRuleById(id)
  if (!existing) throw new NotFoundError('Salary rule not found')
  return salaryRuleRepo.updateSalaryRule(id, data)
}

export async function deleteSalaryRule(id) {
  const existing = await salaryRuleRepo.findSalaryRuleById(id)
  if (!existing) throw new NotFoundError('Salary rule not found')
  return salaryRuleRepo.deleteSalaryRule(id)
}

export async function listSalaryRulesGrid(gridRequest) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)
  const [rows, rowCount] = await salaryRuleRepo.listSalaryRulesForGrid({ skip, take, orderBy, where })
  return {
    rows: rows.map(({ structure, ...rest }) => ({
      ...rest,
      structureName: structure?.name ?? null,
    })),
    rowCount,
  }
}

export async function listSalaryRuleOptions() {
  const rules = await salaryRuleRepo.listSalaryRuleOptions()
  return rules.map(({ structure, ...rest }) => ({
    ...rest,
    structureName: structure?.name ?? null,
  }))
}
