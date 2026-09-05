import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createTimeOffRequestSchema = z.object({
  employeeId: z.string().optional(), // EMPLOYEE role always uses their own; others may specify
  typeId: z.string().min(1),
  startDate: z.iso.date(),
  endDate: z.iso.date(),
  reason: z.string().optional(),
})

export const timeOffRequestListRequestSchema = gridRequestSchema
