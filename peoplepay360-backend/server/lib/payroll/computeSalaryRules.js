import { evaluateFormula } from './formulaEvaluator'

// Convention (matches the seeded "Regular Salary" structure and the plan's
// own wording): a Percentage rule's base resolves to a fixed lookup —
// 'ContractWage' -> the contract wage passed in, 'Basic' -> the categories
// map's `BASIC` entry, 'Gross' -> the `GROSS` entry. Rules must be sequenced
// so the referenced code has already been computed earlier in the pass.
function resolvePercentageBase(base, categories, wage) {
  if (base === 'ContractWage') return wage
  if (base === 'Basic') return categories.BASIC ?? 0
  if (base === 'Gross') return categories.GROSS ?? 0
  throw new Error(`Unknown percentageBase: ${base}`)
}

function computeRuleAmount(rule, categories, context) {
  switch (rule.computationMethod) {
    case 'Fixed':
      return rule.fixedAmount ?? 0
    case 'Percentage': {
      const base = resolvePercentageBase(rule.percentageBase, categories, context.wage)
      return (base * (rule.percentageValue ?? 0)) / 100
    }
    case 'Formula':
      return evaluateFormula(rule.formula, { categories, wage: context.wage, workedDays: context.workedDays })
    default:
      throw new Error(`Unknown computation method: ${rule.computationMethod}`)
  }
}

// rules: SalaryRule[] (any order — sorted here). context: { wage, workedDays }.
// Returns { lines, categories, basic, gross, net } — lines is the ordered
// rule-by-rule breakdown snapshot stored on the Payslip.
export function computeSalaryRules(rules, context) {
  const sorted = [...rules].sort((a, b) => a.sequence - b.sequence)
  const categories = {}
  const lines = []

  for (const rule of sorted) {
    const amount = computeRuleAmount(rule, categories, context)
    categories[rule.code] = amount
    lines.push({ code: rule.code, name: rule.name, category: rule.category, sequence: rule.sequence, amount })
  }

  const lastOfCategory = (category) => {
    const matches = lines.filter((l) => l.category === category)
    return matches.length > 0 ? matches[matches.length - 1].amount : 0
  }

  return {
    lines,
    categories,
    basic: lastOfCategory('Basic'),
    gross: lastOfCategory('Gross'),
    net: lastOfCategory('Net'),
  }
}
