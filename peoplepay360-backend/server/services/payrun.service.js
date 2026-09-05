import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ConflictError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import { computeSalaryRules } from '../lib/payroll/computeSalaryRules'
import { resolveApplicableContract } from '../lib/payroll/resolveApplicableContract'
import { PayslipDocument } from '../lib/payroll/pdf/PayslipDocument'
import { sendPayslipEmail } from '../lib/payroll/email'
import { prisma } from '../lib/prisma'
import * as payrunRepo from '../repositories/payrun.repository'
import * as payslipRepo from '../repositories/payslip.repository'
import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'

const FILTER_FIELD_MAP = {
  status: (filter) => ({ status: { equals: filter.filter } }),
  structureId: (filter) => ({ structureId: { equals: filter.filter } }),
}

function withDates(data) {
  return { ...data, periodStart: new Date(data.periodStart), periodEnd: new Date(data.periodEnd) }
}

export async function createPayrun(data) {
  return payrunRepo.createPayrunWithDraftPayslips(withDates(data))
}

export async function getEligibleEmployees(data) {
  const { periodStart, periodEnd } = withDates(data)
  const employees = await payrunRepo.findEligibleEmployees(periodStart, periodEnd)
  return employees.map((emp) => {
    const contract = emp.contracts[0]
    return {
      id: emp.id,
      name: emp.name,
      workingHours: contract?.workingSchedule?.totalWeeklyHours ?? null,
      startDate: contract?.startDate ?? null,
      wage: contract?.wage ?? null,
    }
  })
}

export async function getPayrun(id) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  const shapedPayslips = (payrun.payslips || []).map(({ employee, ...ps }) => ({
    ...ps,
    employeeName: employee?.name ?? null,
  }))
  return { ...payrun, payslips: shapedPayslips }
}

function assertNotPaid(payrun) {
  if (payrun.status === 'Paid') {
    throw new ConflictError('This Payrun is Paid and finalized — it can no longer be modified')
  }
}

async function countWorkedDays(employeeId, periodStart, periodEnd) {
  return prisma.attendance.count({
    where: {
      employeeId,
      status: 'Present',
      checkOut: { not: null },
      checkIn: { gte: periodStart, lte: periodEnd },
    },
  })
}

// The compute step: resolves each Payslip's applicable contract, runs the
// formula engine, detects warnings, and writes the results. Does not change
// the Payrun's own lifecycle status — Draft stays Draft until Validate.
export async function computePayrun(id) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  assertNotPaid(payrun)

  const structure = await prisma.salaryStructure.findUnique({ where: { id: payrun.structureId }, include: { rules: true } })

  for (const payslip of payrun.payslips) {
    const employee = await prisma.employee.findUnique({ where: { id: payslip.employeeId } })
    const contract = await resolveApplicableContract(payslip.employeeId, payrun.periodStart, payrun.periodEnd)

    const warnings = []
    if (!employee.bankAccount) {
      warnings.push({ type: 'missing_bank', message: `${employee.name} has no bank account on file` })
    }
    const duplicates = await payslipRepo.findOverlappingFinalizedPayslips(payslip.employeeId, payrun.periodStart, payrun.periodEnd, payrun.id)
    if (duplicates.length > 0) {
      warnings.push({ type: 'duplicate', message: `${employee.name} already has a finalized payslip for an overlapping period` })
    }

    if (!contract) {
      warnings.push({ type: 'no_contract', message: `${employee.name} has no Running contract covering this period — cannot compute salary` })
      await payslipRepo.replaceWarnings(payslip.id, warnings)
      continue
    }

    const workedDays = await countWorkedDays(payslip.employeeId, payrun.periodStart, payrun.periodEnd)
    const { lines, basic, gross, net } = computeSalaryRules(structure.rules, { wage: contract.wage, workedDays })

    await payslipRepo.updatePayslipComputation(payslip.id, {
      contractId: contract.id,
      workedDays,
      basic,
      gross,
      net,
      lines,
      status: payslip.status, // compute never changes lifecycle status
    })
    await payslipRepo.replaceWarnings(payslip.id, warnings)
  }

  return getPayrun(id)
}

export async function validatePayrun(id) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  if (payrun.status !== 'Draft') {
    throw new ConflictError('Only a Draft Payrun can be validated')
  }
  await prisma.payslip.updateMany({ where: { payrunId: id }, data: { status: 'Validated' } })
  return payrunRepo.updatePayrunStatus(id, 'Validated')
}

export async function markPayrunPaid(id) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  if (payrun.status !== 'Validated') {
    throw new ConflictError('Only a Validated Payrun can be marked Paid')
  }
  await prisma.payslip.updateMany({ where: { payrunId: id }, data: { status: 'Paid' } })
  return payrunRepo.updatePayrunStatus(id, 'Paid')
}

export async function sendPayslips(id) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  if (payrun.status !== 'Paid') {
    throw new ConflictError('Payslips can only be sent once the Payrun is marked Paid')
  }

  const results = []
  for (const payslip of payrun.payslips) {
    const employee = await prisma.employee.findUnique({ where: { id: payslip.employeeId } })
    const pdfBuffer = await renderToBuffer(React.createElement(PayslipDocument, { payslip, employee, payrun }))
    const info = await sendPayslipEmail({ to: employee.email, employeeName: employee.name, payrunName: payrun.name, pdfBuffer })
    results.push({ employeeId: employee.id, email: employee.email, messageId: info.messageId })
  }
  return results
}

export async function deletePayrun(id, session) {
  const payrun = await payrunRepo.findPayrunById(id)
  if (!payrun) throw new NotFoundError('Payrun not found')
  assertNotPaid(payrun)
  if (session.role === ROLES.HR_PAYROLL_USER) {
    throw new ForbiddenError('HR Payroll User cannot delete Payruns')
  }
  return payrunRepo.deletePayrun(id)
}

export async function listPayrunsGrid(gridRequest) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)
  const [rows, rowCount] = await payrunRepo.listPayrunsForGrid({ skip, take, orderBy, where })
  const shaped = rows.map(({ _count, ...rest }) => ({ ...rest, payslipCount: _count.payslips }))
  return { rows: shaped, rowCount }
}
