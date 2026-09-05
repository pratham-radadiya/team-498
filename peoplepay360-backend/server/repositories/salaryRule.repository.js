import { prisma } from '../lib/prisma'

export function createSalaryRule(data) {
  return prisma.salaryRule.create({ data })
}

export function findSalaryRuleById(id) {
  return prisma.salaryRule.findUnique({ where: { id } })
}

export function updateSalaryRule(id, data) {
  return prisma.salaryRule.update({ where: { id }, data })
}

export function deleteSalaryRule(id) {
  return prisma.salaryRule.delete({ where: { id } })
}

// Always sorted by sequence — rule order is the whole point of this list.
export function listSalaryRulesForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.salaryRule.findMany({ skip, take, orderBy: orderBy ?? { sequence: 'asc' }, where }),
    prisma.salaryRule.count({ where }),
  ])
}
