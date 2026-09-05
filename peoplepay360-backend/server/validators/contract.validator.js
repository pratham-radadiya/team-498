import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createContractSchema = z.object({
  employeeId: z.string().min(1),
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  startDate: z.iso.date(),
  endDate: z.iso.date().optional(),
  wage: z.number().positive(),
  workingScheduleId: z.string().optional(),
  salaryStructureId: z.string().optional(),
  status: z.enum(['Running', 'Expired']).optional(),
  notes: z.string().optional(),
})

export const updateContractSchema = createContractSchema.partial()

export const contractListRequestSchema = gridRequestSchema
