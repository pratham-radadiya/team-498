import { Parser } from 'expr-eval'

// expr-eval only understands a restricted math-expression grammar — no
// function calls to arbitrary JS, no `require`, no property access beyond
// plain member lookups on the objects we hand it. That sandboxing is the
// whole point: a Salary Rule's `formula` string is user-authored config data,
// never trusted as real code.
const parser = new Parser()

export function evaluateFormula(formula, context) {
  const expr = parser.parse(formula)
  return expr.evaluate(context)
}
