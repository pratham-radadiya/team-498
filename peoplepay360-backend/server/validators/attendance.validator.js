import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

// Non-EMPLOYEE roles may check in/out on behalf of another employee; EMPLOYEE
// role always acts on their own session.employeeId regardless of this field
// (enforced in the service layer, not here).
export const checkInSchema = z.object({
  employeeId: z.string().optional(),
})

export const checkOutSchema = z.object({
  employeeId: z.string().optional(),
})

export const updateAttendanceSchema = z.object({
  checkIn: z.iso.datetime({ offset: true }).optional(),
  checkOut: z.iso.datetime({ offset: true }).nullable().optional(),
  status: z.enum(['Present', 'Absent']).optional(),
  notes: z.string().optional(),
})

export const attendanceListRequestSchema = gridRequestSchema
