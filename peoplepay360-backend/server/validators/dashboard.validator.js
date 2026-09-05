import { z } from 'zod'

// employeeType is a SalaryStructure id — the closest real analog to "employee
// type" in this schema (Regular Salary / Intern Salary / Contractor), since
// there is no dedicated employeeType field on Employee or Contract.
export const dashboardFilterSchema = z.object({
  periodStart: z.iso.date().optional(),
  periodEnd: z.iso.date().optional(),
  department: z.string().optional(),
  employeeType: z.string().optional(),
  company: z.string().optional(),
})
