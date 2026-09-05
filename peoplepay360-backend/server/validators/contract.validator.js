import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createContractSchema = z.object({
  employeeId: z.string().min(1),
  department: z.string().nullable().optional(),
  jobPosition: z.string().nullable().optional(),
  startDate: z.string(),
  endDate: z.string().nullable().optional(),
  wage: z.number().positive(),
  workingScheduleId: z.string().nullable().optional(),
  salaryStructureId: z.string().nullable().optional(),
  status: z.enum(['Running', 'Expired']).optional(),
  notes: z.string().nullable().optional(),
})

export const updateContractSchema = createContractSchema.partial()

export const contractListRequestSchema = gridRequestSchema
