require('dotenv/config')
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const bcrypt = require('bcryptjs')
const { faker } = require('@faker-js/faker')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

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

  // ---------- 3. ANCHORS: Working Schedules ----------
  const schedule40h = await prisma.workingSchedule.create({
    data: {
      name: '40 Hours/Week',
      calendarType: 'Standard',
      company: 'PeoplePay360 Inc',
      status: 'Active',
      totalWeeklyHours: 5 * dayHours('09:00', '18:00', 60),
      days: {
        create: ['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => ({
          day,
          startTime: '09:00',
          endTime: '18:00',
          breakMinutes: 60,
          hours: dayHours('09:00', '18:00', 60),
        })),
      },
    },
  })

  const nightShift = await prisma.workingSchedule.create({
    data: {
      name: 'Night Shift',
      calendarType: 'Night Shift',
      company: 'PeoplePay360 Inc',
      status: 'Active',
      totalWeeklyHours: 5 * dayHours('15:00', '23:00', 30),
      days: {
        create: ['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day) => ({
          day,
          startTime: '15:00',
          endTime: '23:00',
          breakMinutes: 30,
          hours: dayHours('15:00', '23:00', 30),
        })),
      },
    },
  })

  const flexibleHybrid = await prisma.workingSchedule.create({
    data: {
      name: 'Flexible Hybrid',
      calendarType: 'Flexible',
      company: 'PeoplePay360 Inc',
      status: 'Active',
      totalWeeklyHours: 4 * dayHours('09:00', '17:00', 30) + dayHours('09:00', '13:00', 0),
      days: {
        create: [
          ...['MON', 'TUE', 'WED', 'THU'].map((day) => ({
            day,
            startTime: '09:00',
            endTime: '17:00',
            breakMinutes: 30,
            hours: dayHours('09:00', '17:00', 30),
          })),
          { day: 'FRI', startTime: '09:00', endTime: '13:00', breakMinutes: 0, hours: dayHours('09:00', '13:00', 0) },
        ],
      },
    },
  })

  const partTime20h = await prisma.workingSchedule.create({
    data: {
      name: 'Part-time 20h',
      calendarType: 'Part-time',
      company: 'PeoplePay360 Inc',
      status: 'Inactive',
      totalWeeklyHours: 4 * dayHours('09:00', '14:00', 0),
      days: {
        create: ['MON', 'TUE', 'WED', 'THU'].map((day) => ({
          day,
          startTime: '09:00',
          endTime: '14:00',
          breakMinutes: 0,
          hours: dayHours('09:00', '14:00', 0),
        })),
      },
    },
  })

  // ---------- 3. ANCHORS: Salary Structures & Rules ----------
  const regularSalary = await prisma.salaryStructure.create({ data: { name: 'Regular Salary', active: true } })
  await prisma.salaryRule.createMany({
    data: [
      { structureId: regularSalary.id, name: 'Basic Salary', code: 'BASIC', category: 'Basic', sequence: 1, computationMethod: 'Percentage', percentageBase: 'ContractWage', percentageValue: 100 },
      { structureId: regularSalary.id, name: 'House Rent Allowance', code: 'HRA', category: 'Allowance', sequence: 10, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 50 },
      { structureId: regularSalary.id, name: 'Standard Allowance', code: 'STD', category: 'Allowance', sequence: 20, computationMethod: 'Fixed', fixedAmount: 1000 },
      { structureId: regularSalary.id, name: 'Performance Bonus', code: 'BONUS', category: 'Allowance', sequence: 30, computationMethod: 'Fixed', fixedAmount: 2000 },
      { structureId: regularSalary.id, name: 'Leave Travel Allowance', code: 'LTA', category: 'Allowance', sequence: 40, computationMethod: 'Fixed', fixedAmount: 1500 },
      { structureId: regularSalary.id, name: 'Fixed Allowance', code: 'FIX', category: 'Allowance', sequence: 50, computationMethod: 'Fixed', fixedAmount: 2000 },
      { structureId: regularSalary.id, name: 'Gross Salary', code: 'GROSS', category: 'Gross', sequence: 60, computationMethod: 'Formula', formula: "categories.BASIC + categories.HRA + categories.STD + categories.BONUS + categories.LTA + categories.FIX" },
      { structureId: regularSalary.id, name: 'LWF Fund', code: 'LWF', category: 'Deduction', sequence: 70, computationMethod: 'Fixed', fixedAmount: 200 },
      { structureId: regularSalary.id, name: 'Provident Fund', code: 'PF', category: 'Deduction', sequence: 80, computationMethod: 'Percentage', percentageBase: 'Basic', percentageValue: 12 },
      { structureId: regularSalary.id, name: 'ESIC', code: 'ESIC', category: 'Deduction', sequence: 90, computationMethod: 'Percentage', percentageBase: 'Gross', percentageValue: 0.75 },
      { structureId: regularSalary.id, name: 'Professional Tax', code: 'PT', category: 'Deduction', sequence: 100, computationMethod: 'Fixed', fixedAmount: 200 },
      { structureId: regularSalary.id, name: 'Net Salary', code: 'NET', category: 'Net', sequence: 110, computationMethod: 'Formula', formula: "categories.GROSS - categories.LWF - categories.PF - categories.ESIC - categories.PT" },
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

  // ---------- 3. ANCHORS: Time Off Types ----------
  const paidTimeOff = await prisma.timeOffType.create({
    data: { name: 'Paid Time Off', unit: 'Days', requiresAllocation: true, approvalRole: 'Manager', payrollWorkEntry: 'Paid Leave', color: 'blue', status: 'Active' },
  })
  const sickLeave = await prisma.timeOffType.create({
    data: { name: 'Sick Leave', unit: 'Days', requiresAllocation: false, approvalRole: 'Manager', payrollWorkEntry: 'Unpaid/Sick', color: 'red', status: 'Active' },
  })
  const compOff = await prisma.timeOffType.create({
    data: { name: 'Comp Off', unit: 'Hours', requiresAllocation: true, approvalRole: 'Officer', payrollWorkEntry: 'Comp Time', color: 'green', status: 'Active' },
  })

  // ---------- 3. ANCHORS: fixed-credential demo Employees + Users, one per role ----------
  const departments = ['Engineering', 'Sales', 'HR', 'Support', 'Finance']
  const jobPositions = ['Developer', 'HR Officer', 'Payroll Specialist', 'Sales Executive', 'Support Engineer', 'Recruiter']
  const schedules = [schedule40h, nightShift, flexibleHybrid, partTime20h]
  const structures = [regularSalary, internSalary, contractorStructure]

  // Employee IS the login account now — every row needs a role + password.
  async function makeEmployee({ name, email, department, jobPosition, workingScheduleId, bankAccount, role, password, status }) {
    const passwordHash = await bcrypt.hash(password, 10)
    return prisma.employee.create({
      data: {
        name,
        email,
        department,
        jobPosition,
        workLocation: faker.helpers.arrayElement(['Head Office', 'Remote', 'Branch Office']),
        company: 'PeoplePay360 Inc',
        workingScheduleId,
        // Phase 6's "missing bank details" Payrun warning needs this to
        // genuinely be null for at least one employee — default to a
        // generated account number, but callers can pass `null` explicitly.
        bankAccount: bankAccount === undefined ? faker.finance.accountNumber(12) : bankAccount,
        status: status ?? 'Active',
        role,
        passwordHash,
      },
    })
  }

  // All demo accounts route to the same real inbox via Gmail's "+tag"
  // addressing (g00998650+admin@gmail.com etc. all deliver to
  // g00998650@gmail.com) — login/identity data only. This does NOT make the
  // Phase 6 "Send Payslips" emails actually arrive there: those go through a
  // fake Ethereal test SMTP account (see Docs/hr-payroll-backend.md Phase 6),
  // which never delivers externally regardless of the `to` address.
  const GMAIL_BASE = 'g00998650'
  const gmailAlias = (tag) => `${GMAIL_BASE}+${tag}@gmail.com`

  const adminEmp = await makeEmployee({ name: 'System Admin', email: gmailAlias('admin'), department: 'Administration', jobPosition: 'System Administrator', workingScheduleId: schedule40h.id, role: 'ADMIN', password: 'Admin@123' })
  const empDemo = await makeEmployee({ name: 'Aarav Mehta', email: gmailAlias('employee'), department: 'Engineering', jobPosition: 'Developer', workingScheduleId: schedule40h.id, role: 'EMPLOYEE', password: 'Employee@123' })
  const hrManagerEmp = await makeEmployee({ name: 'Priya Sharma', email: gmailAlias('hrmanager'), department: 'HR', jobPosition: 'HR Officer', workingScheduleId: schedule40h.id, role: 'HR_MANAGER', password: 'Manager@123' })
  const payrollUserEmp = await makeEmployee({ name: 'Rohan Gupta', email: gmailAlias('payrolluser'), department: 'Finance', jobPosition: 'Payroll Specialist', workingScheduleId: schedule40h.id, role: 'HR_PAYROLL_USER', password: 'Payroll@123' })
  const payrollManagerEmp = await makeEmployee({ name: 'Neha Verma', email: gmailAlias('payrollmanager'), department: 'Finance', jobPosition: 'Payroll Specialist', workingScheduleId: schedule40h.id, role: 'HR_PAYROLL_MANAGER', password: 'Payroll@123' })
  // Edge case: an Inactive login — proves withAuth()'s per-request DB re-check rejects it.
  const inactiveEmp = await makeEmployee({ name: 'Karan Singh', email: gmailAlias('inactive'), department: 'Support', jobPosition: 'Support Engineer', workingScheduleId: flexibleHybrid.id, role: 'EMPLOYEE', password: 'Employee@123', status: 'Inactive' })

  // Realistic small-team org structure: Admin is the root; HR Manager reports
  // to Admin, everyone else reports to the HR Manager.
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

  // ---------- 4. BULK: additional Employees ----------
  const bulkEmployees = [empDemo, hrManagerEmp, payrollUserEmp, payrollManagerEmp, inactiveEmp]
  for (let i = 0; i < 15; i++) {
    const name = faker.person.fullName()
    const emp = await makeEmployee({
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] ?? 'x', provider: 'peoplepay360.com' }).toLowerCase(),
      department: faker.helpers.arrayElement(departments),
      jobPosition: faker.helpers.arrayElement(jobPositions),
      workingScheduleId: faker.helpers.arrayElement(schedules).id,
      // First bulk employee deliberately has no bankAccount — this is now the
      // "missing bank details" Payrun warning demo case (moved off the named
      // anchor employees, who all have complete profiles per request).
      ...(i === 0 ? { bankAccount: null } : {}),
      role: 'EMPLOYEE',
      password: 'Password@123',
    })
    // A few report to the HR Manager, for realistic org structure.
    if (i % 3 === 0) {
      await prisma.employee.update({ where: { id: emp.id }, data: { managerId: hrManagerEmp.id } })
    }
    bulkEmployees.push(emp)
  }
  // One deliberately manager-less, contract-less employee — edge case (new hire, nothing set up yet).
  const newHire = await makeEmployee({ name: 'Zara Khan', email: 'zara@peoplepay360.com', department: 'Engineering', jobPosition: 'Developer', workingScheduleId: null, role: 'EMPLOYEE', password: 'Password@123' })
  bulkEmployees.push(newHire)

  // ---------- 5. RELATIONS: Contracts ----------
  for (const emp of bulkEmployees) {
    if (emp.id === newHire.id) continue // edge case: no contract at all

    const structure = faker.helpers.arrayElement(structures)
    const wage = faker.number.int({ min: 30000, max: 120000 })

    // ~1 in 4 employees get contract history: an Expired one, then a Running one.
    if (faker.number.int({ min: 1, max: 4 }) === 1) {
      await prisma.contract.create({
        data: {
          employeeId: emp.id,
          department: emp.department,
          jobPosition: emp.jobPosition,
          startDate: daysAgo(400),
          endDate: daysAgo(200),
          wage: wage - 5000,
          workingScheduleId: emp.workingScheduleId,
          salaryStructureId: structure.id,
          status: 'Expired',
        },
      })
    }
    await prisma.contract.create({
      data: {
        employeeId: emp.id,
        department: emp.department,
        jobPosition: emp.jobPosition,
        startDate: daysAgo(180),
        endDate: null,
        wage,
        workingScheduleId: emp.workingScheduleId,
        salaryStructureId: structure.id,
        status: 'Running',
      },
    })
  }

  // ---------- 5. RELATIONS: Attendance (~150 rows, last 30 weekdays, several employees) ----------
  const attendanceEmployees = bulkEmployees.slice(0, 12)
  let attendanceRows = []
  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = daysAgo(dayOffset)
    if (date.getDay() === 0 || date.getDay() === 6) continue // skip weekends
    for (const emp of attendanceEmployees) {
      const checkIn = new Date(date)
      checkIn.setHours(9, faker.number.int({ min: 0, max: 20 }), 0, 0)
      const overtimeMinutes = faker.number.int({ min: 0, max: 90 })
      const checkOut = new Date(date)
      checkOut.setHours(18, faker.number.int({ min: 0, max: 20 }) + overtimeMinutes, 0, 0)
      const workedHours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)
      attendanceRows.push({
        employeeId: emp.id,
        checkIn,
        checkOut,
        workedHours,
        overtime: Math.max(0, workedHours - 8),
        status: 'Present',
      })
    }
  }
  await prisma.attendance.createMany({ data: attendanceRows })

  // ---------- 5. RELATIONS: Allocations ----------
  const allocationTargets = bulkEmployees.slice(0, 10)
  const allocations = {}
  for (const emp of allocationTargets) {
    const alloc = await prisma.allocation.create({
      data: {
        employeeId: emp.id,
        typeId: paidTimeOff.id,
        allocated: 20,
        status: 'Approved',
        description: '2026 Annual Balance',
        validFrom: new Date('2026-01-01'),
        validTo: new Date('2026-12-31'),
      },
    })
    allocations[emp.id] = alloc
  }
  // Edge case: a couple of Pending allocations awaiting HR approval.
  for (const emp of bulkEmployees.slice(10, 12)) {
    await prisma.allocation.create({
      data: { employeeId: emp.id, typeId: compOff.id, allocated: 8, status: 'Pending', description: 'Comp Off request' },
    })
  }

  // ---------- 5. RELATIONS: Time Off Requests ----------
  let requestCount = { approved: 0, pending: 0, refused: 0 }
  for (const emp of allocationTargets.slice(0, 6)) {
    const duration = faker.number.int({ min: 1, max: 3 })
    const startDate = daysAgo(faker.number.int({ min: 40, max: 90 }))
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + duration - 1)
    const request = await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id,
        typeId: paidTimeOff.id,
        startDate,
        endDate,
        duration,
        allocationId: allocations[emp.id].id,
        reason: faker.helpers.arrayElement(['Family trip', 'Personal time', 'Vacation', 'Medical']),
        status: 'Approved',
        approverId: null,
      },
    })
    await prisma.allocation.update({ where: { id: allocations[emp.id].id }, data: { taken: { increment: duration } } })
    requestCount.approved++
  }
  // A couple Pending (awaiting approval) and one Refused — edge cases for the approval workflow.
  for (const emp of allocationTargets.slice(6, 8)) {
    await prisma.timeOffRequest.create({
      data: {
        employeeId: emp.id,
        typeId: paidTimeOff.id,
        startDate: daysAgo(-10),
        endDate: daysAgo(-8),
        duration: 3,
        allocationId: allocations[emp.id].id,
        reason: 'Upcoming leave',
        status: 'Pending',
      },
    })
    requestCount.pending++
  }
  await prisma.timeOffRequest.create({
    data: {
      employeeId: allocationTargets[8].id,
      typeId: sickLeave.id, // no allocation required
      startDate: daysAgo(15),
      endDate: daysAgo(15),
      duration: 1,
      allocationId: null,
      reason: 'Refused example',
      status: 'Refused',
    },
  })
  requestCount.refused++

  // ---------- 7. SUMMARY ----------
  const counts = {
    employees: await prisma.employee.count(),
    workingSchedules: await prisma.workingSchedule.count(),
    contracts: await prisma.contract.count(),
    attendance: await prisma.attendance.count(),
    salaryStructures: await prisma.salaryStructure.count(),
    salaryRules: await prisma.salaryRule.count(),
    timeOffTypes: await prisma.timeOffType.count(),
    allocations: await prisma.allocation.count(),
    timeOffRequests: await prisma.timeOffRequest.count(),
  }
  console.log('Seed complete. Row counts:', counts)
  console.log('Time off requests by status:', requestCount)
  console.log(`Demo logins (all "+tag" aliases of ${GMAIL_BASE}@gmail.com — real inbox, but Send Payslips emails still go through the fake Ethereal test SMTP account, not here):`)
  for (const u of demoLogins) console.log(`  ${u.email} / ${u.password} (${u.role}${u.status === 'Inactive' ? ', INACTIVE' : ''})`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
