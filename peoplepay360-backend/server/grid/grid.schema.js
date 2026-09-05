import { z } from 'zod'

const sortModelEntry = z.object({
  colId: z.string(),
  sort: z.enum(['asc', 'desc']),
})

const filterModelEntry = z.object({
  filterType: z.string().optional().default('text'),
  type: z.string().optional().default('equals'),
  filter: z.unknown(),
})

export const gridRequestSchema = z.object({
  startRow: z.number().int().min(0),
  endRow: z.number().int().min(0),
  sortModel: z.array(sortModelEntry).default([]),
  filterModel: z.record(z.string(), filterModelEntry).default({}),
})
