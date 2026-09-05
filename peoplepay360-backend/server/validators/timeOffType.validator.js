import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createTimeOffTypeSchema = z.object({
  name: z.string().min(1),
  unit: z.enum(['Days', 'Hours']).optional(),
  requiresAllocation: z.boolean().optional(),
  approvalRole: z.enum(['Manager', 'Officer']).optional(),
  payrollWorkEntry: z.string().optional(),
  color: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

export const updateTimeOffTypeSchema = createTimeOffTypeSchema.partial()

export const timeOffTypeListRequestSchema = gridRequestSchema
