import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'
import { ROLES } from '../rbac/roles'

const roleEnum = z.enum(Object.values(ROLES))

export const createEmployeeSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: roleEnum,
  department: z.string().nullable().optional(),
  jobPosition: z.string().nullable().optional(),
  workLocation: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  bankAccount: z.string().nullable().optional(),
  workingScheduleId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
})

// password is intentionally excluded here — no password-change flow exists
// yet, so it can never be silently overwritten through a general update.
export const updateEmployeeSchema = createEmployeeSchema.omit({ password: true }).partial()

export const employeeListRequestSchema = gridRequestSchema
