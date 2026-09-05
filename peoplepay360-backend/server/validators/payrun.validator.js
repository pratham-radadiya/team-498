import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

// This is the wizard's step-1 scope + step-2 selection, combined — per the
// plan, "Create Payrun" (the wizard's final click) is the only thing that
// actually persists anything; step 1 alone creates nothing.
export const createPayrunSchema = z.object({
  name: z.string().min(1),
  structureId: z.string().min(1),
  periodStart: z.iso.date(),
  periodEnd: z.iso.date(),
  employeeIds: z.array(z.string().min(1)).min(1),
})

export const eligibleEmployeesSchema = z.object({
  periodStart: z.iso.date(),
  periodEnd: z.iso.date(),
})

export const payrunListRequestSchema = gridRequestSchema
export const payslipListRequestSchema = gridRequestSchema
