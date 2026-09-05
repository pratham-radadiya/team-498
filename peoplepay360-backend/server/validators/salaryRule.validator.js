import { z } from 'zod'
import { gridRequestSchema } from '../grid/grid.schema'

const baseSalaryRuleSchema = z.object({
  structureId: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  category: z.enum(['Basic', 'Allowance', 'Gross', 'Deduction', 'Net']),
  sequence: z.number().int(),
  computationMethod: z.enum(['Fixed', 'Percentage', 'Formula']),
  fixedAmount: z.number().optional(),
  percentageBase: z.enum(['ContractWage', 'Basic', 'Gross']).optional(),
  percentageValue: z.number().optional(),
  formula: z.string().optional(),
})

// A rule's required fields depend on its own computationMethod — enforced
// here so a malformed rule (e.g. Percentage with no percentageValue) is
// rejected at the API boundary, not discovered later mid-payroll-compute.
function requireFieldsForMethod(data, ctx) {
  if (data.computationMethod === 'Fixed' && data.fixedAmount === undefined) {
    ctx.addIssue({ code: 'custom', path: ['fixedAmount'], message: 'fixedAmount is required when computationMethod is Fixed' })
  }
  if (data.computationMethod === 'Percentage' && (data.percentageBase === undefined || data.percentageValue === undefined)) {
    ctx.addIssue({ code: 'custom', path: ['percentageBase'], message: 'percentageBase and percentageValue are required when computationMethod is Percentage' })
  }
  if (data.computationMethod === 'Formula' && !data.formula) {
    ctx.addIssue({ code: 'custom', path: ['formula'], message: 'formula is required when computationMethod is Formula' })
  }
}

export const createSalaryRuleSchema = baseSalaryRuleSchema.superRefine(requireFieldsForMethod)
export const updateSalaryRuleSchema = baseSalaryRuleSchema.partial().superRefine(requireFieldsForMethod)

export const salaryRuleListRequestSchema = gridRequestSchema
