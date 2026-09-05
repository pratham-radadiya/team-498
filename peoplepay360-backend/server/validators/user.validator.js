import { z } from 'zod'
import { ROLES } from '../rbac/roles'

const roleEnum = z.enum(Object.values(ROLES))

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  role: roleEnum,
  employeeId: z.string().min(1),
  status: z.enum(['Active', 'Inactive']).optional(),
})

// employeeId is intentionally excluded — a User's employee link is set once
// at creation and never repointed. Role IS updatable here (Admin editing
// someone else's role), but user.service.js blocks a caller from changing
// their own role regardless of what this schema allows.
export const updateUserSchema = z.object({
  status: z.enum(['Active', 'Inactive']).optional(),
  role: roleEnum.optional(),
})
