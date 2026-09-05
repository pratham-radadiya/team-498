import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema.js'

export const createSalaryStructureSchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
  ruleIds: z.array(z.string()).optional(),
})

export const updateSalaryStructureSchema = createSalaryStructureSchema.partial()

export const addRulesToStructureSchema = z.object({
  ruleIds: z.array(z.string()).min(1),
})

export const salaryStructureListRequestSchema = gridRequestSchema
