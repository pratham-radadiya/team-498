import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createSalaryStructureSchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
})

export const updateSalaryStructureSchema = createSalaryStructureSchema.partial()

export const salaryStructureListRequestSchema = gridRequestSchema
