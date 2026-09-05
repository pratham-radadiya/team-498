import { NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as salaryRuleRepo from '../repositories/salaryRule.repository'
import { prisma } from '../lib/prisma'

const FILTER_FIELD_MAP = {
  name: (filter) => ({ name: { contains: filter.filter, mode: 'insensitive' } }),
  active: (filter) => ({ active: { equals: filter.filter } }),
}

export async function createSalaryStructure(data) {
  const { ruleIds, ...structureData } = data
  const structure = await salaryStructureRepo.createSalaryStructure(structureData)

  if (Array.isArray(ruleIds) && ruleIds.length > 0) {
    const templateRules = await salaryRuleRepo.findRulesByIds(ruleIds)
    const usedCodes = new Set()

    for (const rule of templateRules) {
      if (!usedCodes.has(rule.code)) {
        usedCodes.add(rule.code)
        await salaryRuleRepo.createSalaryRule({
          structureId: structure.id,
          name: rule.name,
          code: rule.code,
          category: rule.category,
          sequence: rule.sequence,
          computationMethod: rule.computationMethod,
          fixedAmount: rule.fixedAmount,
          percentageBase: rule.percentageBase,
          percentageValue: rule.percentageValue,
          formula: rule.formula,
        })
      }
    }
  }

  return salaryStructureRepo.findSalaryStructureById(structure.id)
}

export async function addRulesToStructure(structureId, ruleIds) {
  const existing = await salaryStructureRepo.findSalaryStructureById(structureId)
  if (!existing) throw new NotFoundError('Salary structure not found')

  const existingCodes = new Set((existing.rules || []).map((r) => r.code))
  const templateRules = await salaryRuleRepo.findRulesByIds(ruleIds)

  for (const rule of templateRules) {
    if (!existingCodes.has(rule.code)) {
      existingCodes.add(rule.code)
      await salaryRuleRepo.createSalaryRule({
        structureId,
        name: rule.name,
        code: rule.code,
        category: rule.category,
        sequence: rule.sequence,
        computationMethod: rule.computationMethod,
        fixedAmount: rule.fixedAmount,
        percentageBase: rule.percentageBase,
        percentageValue: rule.percentageValue,
        formula: rule.formula,
      })
    }
  }

  return salaryStructureRepo.findSalaryStructureById(structureId)
}

export async function getSalaryStructure(id) {
  const structure = await salaryStructureRepo.findSalaryStructureById(id)
  if (!structure) throw new NotFoundError('Salary structure not found')
  return structure
}

export async function updateSalaryStructure(id, data) {
  const existing = await salaryStructureRepo.findSalaryStructureById(id)
  if (!existing) throw new NotFoundError('Salary structure not found')
  return salaryStructureRepo.updateSalaryStructure(id, data)
}

export async function deleteSalaryStructure(id) {
  const existing = await salaryStructureRepo.findSalaryStructureById(id)
  if (!existing) throw new NotFoundError('Salary structure not found')
  return salaryStructureRepo.deleteSalaryStructure(id)
}

export async function listSalaryStructuresGrid(gridRequest) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)
  const [rows, rowCount] = await salaryStructureRepo.listSalaryStructuresForGrid({ skip, take, orderBy, where })
  const shaped = rows.map(({ _count, ...rest }) => ({
    ...rest,
    ruleCount: _count.rules,
    employeeCount: _count.contracts,
  }))
  return { rows: shaped, rowCount }
}

export async function listSalaryStructureOptions() {
  return salaryStructureRepo.listSalaryStructureOptions()
}
