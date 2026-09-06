import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createTimeOffRequestSchema = z.object({
  employeeId: z.string().nullable().optional(), // EMPLOYEE role always uses their own; others may specify
  typeId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  reason: z.string().nullable().optional(),
})

export const timeOffRequestListRequestSchema = gridRequestSchema

