// Translates a validated AG Grid Infinite Row Model request into Prisma's
// { skip, take, orderBy, where } shape. `filterFieldMap` lets each module's
// repository control how its own filterable columns map to Prisma where-clauses,
// so this pagination/sort mechanic is written once and reused by every module.
export function buildPrismaGridQuery({ startRow, endRow, sortModel, filterModel }, filterFieldMap = {}) {
  const skip = startRow
  const take = endRow - startRow

  const orderBy = sortModel.length > 0
    ? sortModel.map(({ colId, sort }) => ({ [colId]: sort }))
    : undefined

  const where = {}
  for (const [column, filter] of Object.entries(filterModel)) {
    const applyFilter = filterFieldMap[column]
    if (applyFilter) {
      Object.assign(where, applyFilter(filter))
    }
  }

  return { skip, take, orderBy, where }
}
