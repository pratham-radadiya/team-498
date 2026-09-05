import { prisma } from '../lib/prisma'

export function createSalaryStructure(data) {
  return prisma.salaryStructure.create({ data })
}

export function findSalaryStructureById(id) {
  return prisma.salaryStructure.findUnique({
    where: { id },
    include: { rules: { orderBy: { sequence: 'asc' } } },
  })
}

export function updateSalaryStructure(id, data) {
  return prisma.salaryStructure.update({ where: { id }, data })
}

export function deleteSalaryStructure(id) {
  return prisma.salaryStructure.delete({ where: { id } })
}

// Powers the List view's "Rules" and "Employees" count columns.
export function listSalaryStructuresForGrid({ skip, take, orderBy, where }) {
  return Promise.all([
    prisma.salaryStructure.findMany({
      skip,
      take,
      orderBy,
      where,
      include: { _count: { select: { rules: true, contracts: true } } },
    }),
    prisma.salaryStructure.count({ where }),
  ])
}

export function listSalaryStructureOptions() {
  return prisma.salaryStructure.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })
}
