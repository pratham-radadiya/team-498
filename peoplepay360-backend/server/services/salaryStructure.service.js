import { NotFoundError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import * as salaryStructureRepo from '../repositories/salaryStructure.repository'

const FILTER_FIELD_MAP = {
  name: (filter) => ({ name: { contains: filter.filter, mode: 'insensitive' } }),
  active: (filter) => ({ active: { equals: filter.filter } }),
}

export async function createSalaryStructure(data) {
  return salaryStructureRepo.createSalaryStructure(data)
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
