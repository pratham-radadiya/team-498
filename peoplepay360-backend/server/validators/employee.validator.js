import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  workLocation: z.string().optional(),
  company: z.string().optional(),
  workingScheduleId: z.string().optional(),
  managerId: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

export const updateEmployeeSchema = createEmployeeSchema.partial()

export const employeeListRequestSchema = gridRequestSchema
