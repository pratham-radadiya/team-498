import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

export const createAllocationSchema = z.object({
  employeeId: z.string().min(1),
  typeId: z.string().min(1),
  allocated: z.number().positive(),
  description: z.string().optional(),
  validFrom: z.iso.date().optional(),
  validTo: z.iso.date().optional(),
  status: z.enum(['Pending', 'Approved', 'Refused']).optional(),
})

// `allocated`/`typeId`/`employeeId` are intentionally excludable via partial —
// the common update is just approving/refusing.
export const updateAllocationSchema = createAllocationSchema.partial()

export const allocationListRequestSchema = gridRequestSchema
