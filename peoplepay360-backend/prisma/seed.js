require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')
const { Parser } = require('expr-eval')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })
const exprParser = new Parser()

faker.seed(12345) // deterministic — re-running produces the same dataset

// ---------- 1. GUARD ----------
function assertNotProduction() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Refusing to seed: NODE_ENV=production')
  }
  const url = process.env.DATABASE_URL ?? ''
  if (!/localhost|127\.0\.0\.1/.test(url)) {
    throw new Error(`Refusing to seed: DATABASE_URL does not look like a local dev database (${url})`)
  }
}

// ---------- shared helpers (duplicated from the service layer on purpose —
// this CJS script can't import the app's ESM services without a build step) ----------
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
function dayHours(startTime, endTime, breakMinutes) {
  return (toMinutes(endTime) - toMinutes(startTime) - breakMinutes) / 60
}
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}
function monthRange(monthsBack) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1)
  const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0)
  return { start, end }
}

// ---------- mirrors of server/lib/payroll/{computeSalaryRules,resolveApplicableContract}.js
// (same duplication rationale as above) — these MUST stay behaviorally
// identical to the real engine so seeded Payslip numbers are genuinely
// computed, never fabricated. ----------
function resolvePercentageBase(base, categories, wage) {
  if (base === 'ContractWage') return wage
  if (base === 'Basic') return categories.BASIC ?? 0
  if (base === 'Gross') return categories.GROSS ?? 0
  throw new Error(`Unknown percentageBase: ${base}`)
}
function evaluateFormula(formula, context) {
  return exprParser.parse(formula).evaluate(context)
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
function computeSalaryRulesLocal(rules, context) {
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
  return { lines, categories, basic: lastOfCategory('Basic'), gross: lastOfCategory('Gross'), net: lastOfCategory('Net') }
}
async function resolveApplicableContractRow(employeeId, periodStart, periodEnd) {
  const candidates = await prisma.contract.findMany({
    where: {
      employeeId,
      status: 'Running',
      startDate: { lte: periodEnd },
      OR: [{ endDate: null }, { endDate: { gte: periodStart } }],
    },
    orderBy: { startDate: 'desc' },
  })
  return candidates[0] ?? null
}

async function main() {
  assertNotProduction()

  // ---------- 2. RESET (dev-only, deterministic reseed) ----------
  await prisma.payslipWarning.deleteMany()
  await prisma.payslip.deleteMany()
  await prisma.payrun.deleteMany()
  await prisma.timeOffRequest.deleteMany()
  await prisma.allocation.deleteMany()
  await prisma.timeOffType.deleteMany()
  await prisma.attendance.deleteMany()
  await prisma.employee.updateMany({ data: { managerId: null } }) // break self-ref cycle
  await prisma.contract.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.salaryRule.deleteMany()
  await prisma.salaryStructure.deleteMany()
  await prisma.workingSchedule.deleteMany() // cascades to WorkingScheduleDay

  // ============================================================
  // 3. ANCHORS: Working Schedules — 4 curated patterns. A real org doesn't
  // have hundreds of distinct shift patterns, so this stays small and
  // realistic rather than padded for row count.
  // ============================================================
  const schedule40h = await prisma.workingSchedule.create({
    data: {
      name: '40 Hours/Week', calendarType: 'Standard', company: 'PeoplePay360 Inc', status: 'Active',
      totalWeeklyHours: 5 * dayHours('09:00', '18:00', 60),
      days: { create: ['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => ({ day, startTime: '09:00', endTime: '18:00', breakMinutes: 60, hours: dayHours('09:00', '18:00', 60) })) },
    },
  })
  const nightShift = await prisma.workingSchedule.create({
    data: {
      name: 'Night Shift', calendarType: 'Night Shift', company: 'PeoplePay360 Inc', status: 'Active',
      totalWeeklyHours: 5 * dayHours('15:00', '23:00', 30),
      days: { create: ['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => ({ day, startTime: '15:00', endTime: '23:00', breakMinutes: 30, hours: dayHours('15:00', '23:00', 30) })) },
    },
  })
  const flexibleHybrid = await prisma.workingSchedule.create({
    data: {
      name: 'Flexible Hybrid', calendarType: 'Flexible', company: 'PeoplePay360 Inc', status: 'Active',
      totalWeeklyHours: 4 * dayHours('09:00', '17:00', 30) + dayHours('09:00', '13:00', 0),
      days: {
        create: [
          ...['MON', 'TUE', 'WED', 'THU'].map((day) => ({ day, startTime: '09:00', endTime: '17:00', breakMinutes: 30, hours: dayHours('09:00', '17:00', 30) })),
          { day: 'FRI', startTime: '09:00', endTime: '13:00', breakMinutes: 0, hours: dayHours('09:00', '13:00', 0) },
        ],
      },
    },
  })
  const partTime20h = await prisma.workingSchedule.create({
    data: {
      name: 'Part-time 20h', calendarType: 'Part-time', company: 'PeoplePay360 Inc', status: 'Inactive',
      totalWeeklyHours: 4 * dayHours('09:00', '14:00', 0),
      days: { create: ['MON', 'TUE', 'WED', 'THU'].map((day) => ({ day, startTime: '09:00', endTime: '14:00', breakMinutes: 0, hours: dayHours('09:00', '14:00', 0) })) },
    },
  })

  const anchorSchedules = [schedule40h, nightShift, flexibleHybrid, partTime20h]
  const scheduleAssignPool = anchorSchedules

  // ============================================================
  // 3. ANCHORS: Salary Structures & Rules — a realistic set (9 total), each
  // hand-crafted with a real rule chain. No procedural padding: a real
  // payroll setup has a handful of distinct structures, not hundreds.
  // ============================================================
  const regularSalary = await prisma.salaryStructure.create({ data: { name: 'Regular Salary', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: regularSalary.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: regularSalary.id, name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', sequence: 10, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 50 },
      { structureId: regularSalary.id, name: 'Standard Allowance', code: 'STD', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 1000 },
      { structureId: regularSalary.id, name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', sequence: 30, computationMethod: 'Fixed', fixedAmount: 2000 },
      { structureId: regularSalary.id, name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', sequence: 40, computationMethod: 'Fixed', fixedAmount: 1500 },
      { structureId: regularSalary.id, name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', sequence: 50, computationMethod: 'Fixed', fixedAmount: 2000 },
      { structureId: regularSalary.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 60, computationMethod: 'Formula', formula: 'categories.BASIC + categories.HRA + categories.STD + categories.BONUS + categories.LTA + categories.FIX' },
      { structureId: regularSalary.id, name: 'LWF Fund', code: 'LWF', category: 'Deduction', sequence: 70, computationMethod: 'Fixed', fixedAmount: 200 },
      { structureId: regularSalary.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 80, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: regularSalary.id, name: 'ESIC', code: 'ESIC', category: 'Deduction', sequence: 90, computationMethod: 'Percentage', percentageBase: 'Gross', percentageValue: 0.75 },
      { structureId: regularSalary.id, name: 'Professional Tax', code: 'PT', category: 'Deduction', sequence: 100, computationMethod: 'Fixed', fixedAmount: 200 },
      { structureId: regularSalary.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 110, computationMethod: 'Formula', formula: 'categories.GROSS - categories.LWF - categories.PF - categories.ESIC - categories.PT' },
    ],
  })

  const internSalary = await prisma.salaryStructure.create({ data: { name: 'Intern Salary', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: internSalary.id, name: 'Basic Stipend', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: internSalary.id, name: 'Internet Allowance', code: 'NET_ALLOW', category: 'Allowance', sequence: 10, computationMethod: 'Fixed', fixedAmount: 500 },
      { structureId: internSalary.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 20, computationMethod: 'Formula', formula: 'categories.BASIC + categories.NET_ALLOW' },
      { structureId: internSalary.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 30, computationMethod: 'Formula', formula: 'categories.GROSS' },
    ],
  })

  const contractorStructure = await prisma.salaryStructure.create({ data: { name: 'Contractor', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: contractorStructure.id, name: 'Basic Fee', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: contractorStructure.id, name: 'Gross', code: 'GROSS', category: 'Gross', sequence: 10, computationMethod: 'Formula', formula: 'categories.BASIC' },
      { structureId: contractorStructure.id, name: 'Net', code: 'NET', category: 'Net', sequence: 20, computationMethod: 'Formula', formula: 'categories.GROSS' },
    ],
  })

  const seniorManagement = await prisma.salaryStructure.create({ data: { name: 'Senior Management', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: seniorManagement.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: seniorManagement.id, name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', sequence: 10, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 60 },
      { structureId: seniorManagement.id, name: 'Leadership Allowance', code: 'LEAD', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 5000 },
      { structureId: seniorManagement.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 30, computationMethod: 'Formula', formula: 'categories.BASIC + categories.HRA + categories.LEAD' },
      { structureId: seniorManagement.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 40, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: seniorManagement.id, name: 'Professional Tax', code: 'PT', category: 'Deduction', sequence: 50, computationMethod: 'Fixed', fixedAmount: 200 },
      { structureId: seniorManagement.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 60, computationMethod: 'Formula', formula: 'categories.GROSS - categories.PF - categories.PT' },
    ],
  })

  const salesCommission = await prisma.salaryStructure.create({ data: { name: 'Sales Commission-Based', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: salesCommission.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 70 },
      { structureId: salesCommission.id, name: 'Commission Allowance', code: 'COMM', category: 'Allowance', sequence: 10, computationMethod: 'Fixed', fixedAmount: 3000 },
      { structureId: salesCommission.id, name: 'Travel Allowance', code: 'TRAVEL', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 1500 },
      { structureId: salesCommission.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 30, computationMethod: 'Formula', formula: 'categories.BASIC + categories.COMM + categories.TRAVEL' },
      { structureId: salesCommission.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 40, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: salesCommission.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 50, computationMethod: 'Formula', formula: 'categories.GROSS - categories.PF' },
    ],
  })

  const nightShiftStructure = await prisma.salaryStructure.create({ data: { name: 'Night Shift Differential', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: nightShiftStructure.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: nightShiftStructure.id, name: 'Night Shift Allowance', code: 'NIGHT', category: 'Allowance', sequence: 10, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 15 },
      { structureId: nightShiftStructure.id, name: 'Standard Allowance', code: 'STD', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 1000 },
      { structureId: nightShiftStructure.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 30, computationMethod: 'Formula', formula: 'categories.BASIC + categories.NIGHT + categories.STD' },
      { structureId: nightShiftStructure.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 40, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: nightShiftStructure.id, name: 'ESIC', code: 'ESIC', category: 'Deduction', sequence: 50, computationMethod: 'Percentage', percentageBase: 'Gross', percentageValue: 0.75 },
      { structureId: nightShiftStructure.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 60, computationMethod: 'Formula', formula: 'categories.GROSS - categories.PF - categories.ESIC' },
    ],
  })

  const remoteWorker = await prisma.salaryStructure.create({ data: { name: 'Remote Worker', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: remoteWorker.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: remoteWorker.id, name: 'Remote/Internet Allowance', code: 'REMOTE', category: 'Allowance', sequence: 10, computationMethod: 'Fixed', fixedAmount: 2000 },
      { structureId: remoteWorker.id, name: 'Equipment Allowance', code: 'EQUIP', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 1000 },
      { structureId: remoteWorker.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 30, computationMethod: 'Formula', formula: 'categories.BASIC + categories.REMOTE + categories.EQUIP' },
      { structureId: remoteWorker.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 40, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: remoteWorker.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 50, computationMethod: 'Formula', formula: 'categories.GROSS - categories.PF' },
    ],
  })

  const probationary = await prisma.salaryStructure.create({ data: { name: 'Probationary', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: probationary.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 90 },
      { structureId: probationary.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 10, computationMethod: 'Formula', formula: 'categories.BASIC' },
      { structureId: probationary.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 20, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: probationary.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 30, computationMethod: 'Formula', formula: 'categories.GROSS - categories.PF' },
    ],
  })

  const apprenticeStipend = await prisma.salaryStructure.create({ data: { name: 'Apprentice Stipend', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: apprenticeStipend.id, name: 'Stipend', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: apprenticeStipend.id, name: 'Gross', code: 'GROSS', category: 'Gross', sequence: 10, computationMethod: 'Formula', formula: 'categories.BASIC' },
      { structureId: apprenticeStipend.id, name: 'Net', code: 'NET', category: 'Net', sequence: 20, computationMethod: 'Formula', formula: 'categories.GROSS' },
    ],
  })

  const anchorStructures = [regularSalary, internSalary, contractorStructure, seniorManagement, salesCommission, nightShiftStructure, remoteWorker, probationary, apprenticeStipend]
  const contractStructurePool = anchorStructures

  // ============================================================
  // 3. ANCHORS: Time Off Types — a realistic policy set (7 total). No
  // procedural padding: a real company has a handful of leave types, not
  // hundreds.
  // ============================================================
  const paidTimeOff = await prisma.timeOffType.create({
    data: { name: 'Paid Time Off', unit: 'Days', requiresAllocation: true, approvalRole: 'Manager', payrollWorkEntry: 'Paid Leave', color: 'blue', status: 'Active' },
  })
  const sickLeave = await prisma.timeOffType.create({
    data: { name: 'Sick Leave', unit: 'Days', requiresAllocation: false, approvalRole: 'Manager', payrollWorkEntry: 'Unpaid/Sick', color: 'red', status: 'Active' },
  })
  const compOff = await prisma.timeOffType.create({
    data: { name: 'Comp Off', unit: 'Hours', requiresAllocation: true, approvalRole: 'Officer', payrollWorkEntry: 'Comp Time', color: 'green', status: 'Active' },
  })

  await prisma.timeOffType.create({
    data: { name: 'Maternity Leave', unit: 'Days', requiresAllocation: true, approvalRole: 'Manager', payrollWorkEntry: 'Paid Leave', color: 'purple', status: 'Active' },
  })
  await prisma.timeOffType.create({
    data: { name: 'Paternity Leave', unit: 'Days', requiresAllocation: true, approvalRole: 'Manager', payrollWorkEntry: 'Paid Leave', color: 'teal', status: 'Active' },
  })
  await prisma.timeOffType.create({
    data: { name: 'Bereavement Leave', unit: 'Days', requiresAllocation: false, approvalRole: 'Manager', payrollWorkEntry: 'Paid Leave', color: 'amber', status: 'Active' },
  })
  await prisma.timeOffType.create({
    data: { name: 'Unpaid Leave', unit: 'Days', requiresAllocation: false, approvalRole: 'Officer', payrollWorkEntry: 'Unpaid/Sick', color: 'red', status: 'Active' },
  })

  // ============================================================
  // 3/4. Employees — Employee IS the login account, every row needs role + password.
  // ============================================================
  const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Support', 'Finance', 'Marketing', 'Operations', 'Legal']
  const JOB_POSITIONS = ['Developer', 'HR Officer', 'Payroll Specialist', 'Sales Executive', 'Support Engineer', 'Recruiter', 'Product Manager', 'Data Analyst', 'QA Engineer', 'Legal Counsel', 'Marketing Specialist', 'Operations Manager']

  async function makeEmployee({ name, email, department, jobPosition, workingScheduleId, bankAccount, role, password, status }) {
    const passwordHash = await bcrypt.hash(password, 10)
    return prisma.employee.create({
      data: {
        name, email, department, jobPosition,
        workLocation: faker.helpers.arrayElement(['Head Office', 'Remote', 'Branch Office']),
        company: 'PeoplePay360 Inc',
        workingScheduleId,
        bankAccount: bankAccount === undefined ? faker.finance.accountNumber(12) : bankAccount,
        status: status ?? 'Active',
        role,
        passwordHash,
      },
    })
  }

  // All demo accounts route to the same real inbox via Gmail's "+tag"
  // addressing — login/identity data only; Send Payslips emails still go
  // through the configured SMTP account, not here.
  const GMAIL_BASE = 'g00998650'
  const gmailAlias = (tag) => `${GMAIL_BASE}+${tag}@gmail.com`

  const adminEmp = await makeEmployee({ name: 'System Admin', email: gmailAlias('admin'), department: 'Administration', jobPosition: 'System Administrator', workingScheduleId: schedule40h.id, role: 'ADMIN', password: 'Admin@123' })
  const empDemo = await makeEmployee({ name: 'Aarav Mehta', email: gmailAlias('employee'), department: 'Engineering', jobPosition: 'Developer', workingScheduleId: schedule40h.id, role: 'EMPLOYEE', password: 'Employee@123' })
  const hrManagerEmp = await makeEmployee({ name: 'Priya Sharma', email: gmailAlias('hrmanager'), department: 'HR', jobPosition: 'HR Officer', workingScheduleId: schedule40h.id, role: 'HR_MANAGER', password: 'Manager@123' })
  const payrollUserEmp = await makeEmployee({ name: 'Rohan Gupta', email: gmailAlias('payrolluser'), department: 'Finance', jobPosition: 'Payroll Specialist', workingScheduleId: schedule40h.id, role: 'HR_PAYROLL_USER', password: 'Payroll@123' })
  const payrollManagerEmp = await makeEmployee({ name: 'Neha Verma', email: gmailAlias('payrollmanager'), department: 'Finance', jobPosition: 'Payroll Specialist', workingScheduleId: schedule40h.id, role: 'HR_PAYROLL_MANAGER', password: 'Payroll@123' })
  const inactiveEmp = await makeEmployee({ name: 'Karan Singh', email: gmailAlias('inactive'), department: 'Support', jobPosition: 'Support Engineer', workingScheduleId: flexibleHybrid.id, role: 'EMPLOYEE', password: 'Employee@123', status: 'Inactive' })

  await prisma.employee.update({ where: { id: hrManagerEmp.id }, data: { managerId: adminEmp.id } })
  await prisma.employee.update({ where: { id: empDemo.id }, data: { managerId: hrManagerEmp.id } })
  await prisma.employee.update({ where: { id: payrollUserEmp.id }, data: { managerId: hrManagerEmp.id } })
  await prisma.employee.update({ where: { id: payrollManagerEmp.id }, data: { managerId: hrManagerEmp.id } })
  await prisma.employee.update({ where: { id: inactiveEmp.id }, data: { managerId: hrManagerEmp.id } })

  const demoLogins = [
    { email: gmailAlias('admin'), password: 'Admin@123', role: 'ADMIN' },
    { email: gmailAlias('employee'), password: 'Employee@123', role: 'EMPLOYEE' },
    { email: gmailAlias('hrmanager'), password: 'Manager@123', role: 'HR_MANAGER' },
    { email: gmailAlias('payrolluser'), password: 'Payroll@123', role: 'HR_PAYROLL_USER' },
    { email: gmailAlias('payrollmanager'), password: 'Payroll@123', role: 'HR_PAYROLL_MANAGER' },
    { email: gmailAlias('inactive'), password: 'Employee@123', role: 'EMPLOYEE', status: 'Inactive' },
  ]

  // ---------- 4. BULK: 250 additional Employees (total Employee rows = 257) ----------
  // Admin is deliberately excluded from all payroll/attendance/time-off bulk
  // generation below — Admin is a pure access account, not a payroll subject
  // (matches the Phase 7 dashboard verification: Admin shows avgWage: 0).
  const bulkEmployees = [empDemo, hrManagerEmp, payrollUserEmp, payrollManagerEmp, inactiveEmp]
  for (let i = 0; i < 250; i++) {
    const name = faker.person.fullName()
    // ~1 in 7 have no bank account (missing_bank Payrun warning demo case,
    // spread across the population instead of one hardcoded employee).
    const noBankAccount = i % 7 === 0
    // A handful of bulk employees get a non-Employee role for RBAC variety.
    let role = 'EMPLOYEE'
    if (i % 47 === 0) role = 'HR_PAYROLL_USER'
    else if (i % 53 === 0) role = 'HR_PAYROLL_MANAGER'
    else if (i % 61 === 0) role = 'HR_MANAGER'

    const emp = await makeEmployee({
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] ?? 'x', provider: 'peoplepay360.com' }).toLowerCase() + `.${i}`,
      department: faker.helpers.arrayElement(DEPARTMENTS),
      jobPosition: faker.helpers.arrayElement(JOB_POSITIONS),
      workingScheduleId: faker.helpers.arrayElement(scheduleAssignPool).id,
      ...(noBankAccount ? { bankAccount: null } : {}),
      role,
      password: 'Password@123',
    })
    if (i % 3 === 0) {
      await prisma.employee.update({ where: { id: emp.id }, data: { managerId: hrManagerEmp.id } })
    }
    bulkEmployees.push(emp)
  }
  // One deliberately manager-less, contract-less employee — edge case (new hire, nothing set up yet).
  const newHire = await makeEmployee({ name: 'Zara Khan', email: 'zara@peoplepay360.com', department: 'Engineering', jobPosition: 'Developer', workingScheduleId: null, role: 'EMPLOYEE', password: 'Password@123' })
  bulkEmployees.push(newHire)

  // ============================================================
  // 5. RELATIONS: Contracts — randomized tenure so Payruns spanning many
  // months back get a realistic mix of "contract found" / "no_contract".
  // ============================================================
  for (const emp of bulkEmployees) {
    if (emp.id === newHire.id) continue // edge case: no contract at all

    const structure = faker.helpers.arrayElement(contractStructurePool)
    const wage = faker.number.int({ min: 30000, max: 120000 })
    const runningStartOffset = faker.number.int({ min: 60, max: 400 }) // days ago

    if (faker.number.int({ min: 1, max: 4 }) === 1) {
      const expiredEndOffset = runningStartOffset + faker.number.int({ min: 10, max: 40 })
      const expiredStartOffset = expiredEndOffset + faker.number.int({ min: 150, max: 300 })
      await prisma.contract.create({
        data: {
          employeeId: emp.id, department: emp.department, jobPosition: emp.jobPosition,
          startDate: daysAgo(expiredStartOffset), endDate: daysAgo(expiredEndOffset),
          wage: wage - 5000, workingScheduleId: emp.workingScheduleId, salaryStructureId: structure.id, status: 'Expired',
        },
      })
    }
    await prisma.contract.create({
      data: {
        employeeId: emp.id, department: emp.department, jobPosition: emp.jobPosition,
        startDate: daysAgo(runningStartOffset), endDate: null,
        wage, workingScheduleId: emp.workingScheduleId, salaryStructureId: structure.id, status: 'Running',
      },
    })
  }

  // ============================================================
  // 5. RELATIONS: Attendance
  // ============================================================
  const attendanceEmployees = bulkEmployees.slice(0, 80)
  let attendanceRows = []
  for (let dayOffset = 0; dayOffset < 45; dayOffset++) {
    const date = daysAgo(dayOffset)
    if (date.getDay() === 0 || date.getDay() === 6) continue
    for (const emp of attendanceEmployees) {
      const checkIn = new Date(date)
      checkIn.setHours(9, faker.number.int({ min: 0, max: 20 }), 0, 0)
      const overtimeMinutes = faker.number.int({ min: 0, max: 90 })
      const checkOut = new Date(date)
      checkOut.setHours(18, faker.number.int({ min: 0, max: 20 }) + overtimeMinutes, 0, 0)
      const workedHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      attendanceRows.push({
        employeeId: emp.id, checkIn, checkOut, workedHours,
        overtime: Math.max(0, workedHours - 8), status: 'Present',
      })
    }
  }
  await prisma.attendance.createMany({ data: attendanceRows })

  // ============================================================
  // 5. RELATIONS: Allocations + Time Off Requests
  // Every non-admin employee (256, incl. Zara) gets a Paid Time Off
  // allocation + one request against it, except Zara who gets the
  // no-allocation Sick Leave edge case instead (fits her "new hire" story).
  // ============================================================
  const allocationTargets = bulkEmployees.filter((e) => e.id !== newHire.id)
  const allocations = {}
  for (const emp of allocationTargets) {
    const alloc = await prisma.allocation.create({
      data: { employeeId: emp.id, typeId: paidTimeOff.id, allocated: 20, status: 'Approved', description: '2026 Annual Balance', validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31') },
    })
    allocations[emp.id] = alloc
  }
  // Extra Pending allocations awaiting HR approval, for variety.
  for (const emp of allocationTargets.slice(0, 30)) {
    await prisma.allocation.create({ data: { employeeId: emp.id, typeId: compOff.id, allocated: 8, status: 'Pending', description: 'Comp Off request' } })
  }

  let requestCount = { approved: 0, pending: 0, refused: 0 }
  for (const emp of allocationTargets) {
    const duration = faker.number.int({ min: 1, max: 3 })
    const startDate = daysAgo(faker.number.int({ min: -20, max: 90 }))
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration - 1)
    const status = faker.helpers.arrayElement(['Approved', 'Approved', 'Approved', 'Pending', 'Refused'])

    await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id, typeId: paidTimeOff.id, startDate, endDate, duration,
        allocationId: allocations[emp.id].id,
        reason: faker.helpers.arrayElement(['Family trip', 'Personal time', 'Vacation', 'Medical', 'Wedding', 'Travel']),
        status, approverId: status === 'Approved' || status === 'Refused' ? adminEmp.id : null,
      },
    })
    if (status === 'Approved') {
      await prisma.allocation.update({ where: { id: allocations[emp.id].id }, data: { taken: { increment: duration } } })
      requestCount.approved++
    } else if (status === 'Pending') {
      requestCount.pending++
    } else {
      requestCount.refused++
    }
  }
  // Zara: the "new hire, nothing set up yet" edge case — Sick Leave needs no allocation.
  await prisma.timeOffRequest.create({
    data: { employeeId: newHire.id, typeId: sickLeave.id, startDate: daysAgo(15), endDate: daysAgo(15), duration: 1, allocationId: null, reason: 'First week illness', status: 'Refused' },
  })
  requestCount.refused++

  // ============================================================
  // 6. Payruns + Payslips + PayslipWarnings — real computed numbers, using
  // the same engine logic as server/lib/payroll/computeSalaryRules.js and
  // the same overlap/duplicate/missing-bank warning rules as
  // server/services/payrun.service.js. Restricted to the 3 hand-verified
  // structures (regularSalary/internSalary/contractorStructure), spanning
  // the last 24 months, so both "found a contract" and "no_contract"
  // outcomes occur naturally depending on each employee's real tenure.
  // ============================================================
  const payrollPool = bulkEmployees // includes Zara (guaranteed no_contract) and the named anchors
  const payrunStructures = [regularSalary, internSalary, contractorStructure]
  const structureRulesMap = {}
  for (const s of payrunStructures) {
    structureRulesMap[s.id] = await prisma.salaryRule.findMany({ where: { structureId: s.id } })
  }

  const finalizedPeriodsByEmployee = {} // employeeId -> [{start, end}] for Validated/Paid payslips already created

  const PAYRUN_COUNT = 260
  let payslipTotal = 0
  let warningTotal = 0
  for (let i = 0; i < PAYRUN_COUNT; i++) {
    const monthsBack = faker.number.int({ min: 0, max: 23 })
    const { start: periodStart, end: periodEnd } = monthRange(monthsBack)
    const structure = faker.helpers.arrayElement(payrunStructures)
    const rules = structureRulesMap[structure.id]
    const batch = faker.helpers.arrayElements(payrollPool, faker.number.int({ min: 3, max: 6 }))
    const status = monthsBack === 0
      ? faker.helpers.arrayElement(['Draft', 'Validated'])
      : faker.helpers.arrayElement(['Draft', 'Validated', 'Paid', 'Paid'])

    const payslipsData = []
    for (const emp of batch) {
      const contract = await resolveApplicableContractRow(emp.id, periodStart, periodEnd)
      const warnings = []
      let contractId = null, workedDays = null, basic = null, gross = null, net = null, lines = null

      if (!contract) {
        warnings.push({ type: 'no_contract', message: `${emp.name} has no Running contract covering this period — cannot compute salary` })
      } else {
        contractId = contract.id
        if (!emp.bankAccount) warnings.push({ type: 'missing_bank', message: `${emp.name} has no bank account on file` })

        const priorFinalized = finalizedPeriodsByEmployee[emp.id] || []
        const overlapsFinalized = priorFinalized.some((p) => p.start <= periodEnd && p.end >= periodStart)
        if (overlapsFinalized) warnings.push({ type: 'duplicate', message: `${emp.name} already has a finalized payslip for an overlapping period` })

        workedDays = await prisma.attendance.count({
          where: { employeeId: emp.id, status: 'Present', checkOut: { not: null }, checkIn: { gte: periodStart, lte: periodEnd } },
        })
        const computed = computeSalaryRulesLocal(rules, { wage: contract.wage, workedDays })
        basic = computed.basic
        gross = computed.gross
        net = computed.net
        lines = computed.lines
      }

      payslipsData.push({ employeeId: emp.id, contractId, status, workedDays, basic, gross, net, lines, warnings: { create: warnings } })
      warningTotal += warnings.length
    }

    await prisma.payrun.create({
      data: {
        name: `${structure.name} Payroll — ${periodStart.toLocaleString('en-US', { month: 'long', year: 'numeric' })} (#${i + 1})`,
        structureId: structure.id, periodStart, periodEnd, status,
        payslips: { create: payslipsData },
      },
    })
    payslipTotal += payslipsData.length

    if (status === 'Validated' || status === 'Paid') {
      for (const emp of batch) {
        finalizedPeriodsByEmployee[emp.id] ??= []
        finalizedPeriodsByEmployee[emp.id].push({ start: periodStart, end: periodEnd })
      }
    }
  }

  // ---------- 7. SUMMARY ----------
  const counts = {
    employees: await prisma.employee.count(),
    workingSchedules: await prisma.workingSchedule.count(),
    workingScheduleDays: await prisma.workingScheduleDay.count(),
    contracts: await prisma.contract.count(),
    attendance: await prisma.attendance.count(),
    salaryStructures: await prisma.salaryStructure.count(),
    salaryRules: await prisma.salaryRule.count(),
    timeOffTypes: await prisma.timeOffType.count(),
    allocations: await prisma.allocation.count(),
    timeOffRequests: await prisma.timeOffRequest.count(),
    payruns: await prisma.payrun.count(),
    payslips: await prisma.payslip.count(),
    payslipWarnings: await prisma.payslipWarning.count(),
  }
  console.log('Seed complete. Row counts:', counts)
  console.log('Time off requests by status:', requestCount)
  console.log(`Demo logins (all "+tag" aliases of ${GMAIL_BASE}@gmail.com):`)
  for (const u of demoLogins) console.log(`  ${u.email} / ${u.password} (${u.role}${u.status === 'Inactive' ? ', INACTIVE' : ''})`)

  // WorkingSchedule/TimeOffType/SalaryStructure/SalaryRule are intentionally
  // small/realistic (a handful of curated rows each), not padded to 250 — a
  // real org doesn't have hundreds of distinct shift patterns, leave
  // policies, or salary structures. Every other table still targets 250+.
  const REALISTIC_SMALL_TABLES = ['workingSchedules', 'workingScheduleDays', 'timeOffTypes', 'salaryStructures', 'salaryRules']
  const belowTarget = Object.entries(counts).filter(([k, v]) => !REALISTIC_SMALL_TABLES.includes(k) && v < 250)
  if (belowTarget.length > 0) {
    console.warn('⚠️  Tables below the 250-row target:', belowTarget)
  } else {
    console.log('✅ Every table that should scale with volume has >= 250 rows; WorkingSchedule/TimeOffType/SalaryStructure/SalaryRule are deliberately kept small and realistic instead.')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
