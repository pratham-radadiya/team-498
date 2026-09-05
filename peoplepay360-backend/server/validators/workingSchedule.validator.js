import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/

const dayInputSchema = z.object({
  day: z.enum(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']),
  startTime: z.string().regex(timePattern, 'Expected HH:mm'),
  endTime: z.string().regex(timePattern, 'Expected HH:mm'),
  breakMinutes: z.number().int().min(0).optional().default(0),
})

export const createWorkingScheduleSchema = z.object({
  name: z.string().min(1),
  calendarType: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  days: z.array(dayInputSchema).min(1),
  // totalWeeklyHours is deliberately NOT accepted here — always server-computed from `days`.
})

export const updateWorkingScheduleSchema = createWorkingScheduleSchema.partial().extend({
  days: z.array(dayInputSchema).min(1).optional(),
})

export const workingScheduleListRequestSchema = gridRequestSchema
