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

export function listSalaryRulesForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.salaryRule.findMany({
      skip,
      take,
      orderBy: orderBy ?? { sequence: 'asc' },
      where,
      include: { structure: { select: { name: true } } },
    }),
    prisma.salaryRule.count({ where }),
  ])
}

export function listSalaryRuleOptions() {
  return prisma.salaryRule.findMany({
    orderBy: [{ category: 'asc' }, { sequence: 'asc' }, { name: 'asc' }],
    include: { structure: { select: { name: true } } },
  })
}

export function findRulesByIds(ids) {
  return prisma.salaryRule.findMany({
    where: { id: { in: ids } },
  })
}
