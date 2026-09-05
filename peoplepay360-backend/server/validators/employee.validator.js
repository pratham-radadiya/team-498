import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'
import { ROLES } from '../rbac/roles'

const roleEnum = z.enum(Object.values(ROLES))

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(8),
  role: roleEnum,
  department: z.string().optional(),
  jobPosition: z.string().optional(),
  workLocation: z.string().optional(),
  company: z.string().optional(),
  workingScheduleId: z.string().optional(),
  managerId: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

// password is intentionally excluded here — no password-change flow exists
// yet, so it can never be silently overwritten through a general update.
export const updateEmployeeSchema = createEmployeeSchema.omit({ password: true }).partial()

export const employeeListRequestSchema = gridRequestSchema
