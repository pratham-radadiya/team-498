import { payslipListRequestSchema } from '../validators/payrun.validator'
import * as payslipService from '../services/payslip.service'

export async function getPayslipController(id, session) {
  const payslip = await payslipService.getPayslip(id, session)
  return Response.json(payslip)
}

export async function getPayslipPdfController(id, session) {
  const pdfBuffer = await payslipService.getPayslipPdf(id, session)
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="payslip-${id}.pdf"`,
    },
  })
}

export async function deletePayslipController(id, session) {
  await payslipService.deletePayslip(id, session)
  return new Response(null, { status: 204 })
}

export async function listPayslipsController(request, session) {
  const body = await request.json()
  const gridRequest = payslipListRequestSchema.parse(body)
  const result = await payslipService.listPayslipsGrid(gridRequest, session)
  return Response.json(result)
}
