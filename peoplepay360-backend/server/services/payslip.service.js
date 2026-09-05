import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { ROLES } from '../rbac/roles'
import { ForbiddenError } from '../rbac/guards'
import { NotFoundError, ConflictError } from '../lib/httpErrors'
import { buildPrismaGridQuery } from '../grid/buildPrismaGridQuery'
import { PayslipDocument } from '../lib/payroll/pdf/PayslipDocument'
import * as payslipRepo from '../repositories/payslip.repository'

const FILTER_FIELD_MAP = {
  employeeId: (filter) => ({ employeeId: { equals: filter.filter } }),
  payrunId: (filter) => ({ payrunId: { equals: filter.filter } }),
  status: (filter) => ({ status: { equals: filter.filter } }),
}

export async function getPayslip(id, session) {
  const payslip = await payslipRepo.findPayslipById(id)
  if (!payslip) throw new NotFoundError('Payslip not found')
  if (session.role === ROLES.EMPLOYEE && payslip.employeeId !== session.employeeId) {
    throw new ForbiddenError('You may only view your own payslips')
  }
  const { employee, payrun, ...rest } = payslip
  return {
    ...rest,
    employee,
    payrun,
    employeeName: employee?.name ?? null,
    payrunStatus: payrun?.status ?? null,
  }
}

export async function getPayslipPdf(id, session) {
  const payslip = await getPayslip(id, session) // reuses the same ownership check
  const pdfBuffer = await renderToBuffer(
    React.createElement(PayslipDocument, { payslip, employee: payslip.employee, payrun: payslip.payrun })
  )
  return pdfBuffer
}

export async function deletePayslip(id, session) {
  const payslip = await payslipRepo.findPayslipById(id)
  if (!payslip) throw new NotFoundError('Payslip not found')
  if (payslip.payrun.status === 'Paid') {
    throw new ConflictError('This Payslip belongs to a Paid, finalized Payrun and cannot be deleted')
  }
  if (session.role === ROLES.HR_PAYROLL_USER) {
    throw new ForbiddenError('HR Payroll User cannot delete Payslips')
  }
  return payslipRepo.deletePayslip(id)
}

export async function listPayslipsGrid(gridRequest, session) {
  const { skip, take, orderBy, where } = buildPrismaGridQuery(gridRequest, FILTER_FIELD_MAP)

  const effectiveWhere =
    session.role === ROLES.EMPLOYEE ? { ...where, employeeId: session.employeeId } : where

  const [rows, rowCount] = await payslipRepo.listPayslipsForGrid({ skip, take, orderBy, where: effectiveWhere })
  const shaped = rows.map(({ employee, ...rest }) => ({ ...rest, employeeName: employee?.name ?? null }))
  return { rows: shaped, rowCount }
}
