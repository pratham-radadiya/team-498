import nodemailer from 'nodemailer'

let cachedTransport = null

function getTransport() {
  if (cachedTransport) return cachedTransport
  cachedTransport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  })
  return cachedTransport
}

export async function sendPayslipEmail({ to, employeeName, payrunName, pdfBuffer }) {
  const transport = getTransport()
  return transport.sendMail({
    from: process.env.SMTP_FROM ?? 'PeoplePay360 <payroll@peoplepay360.com>',
    to,
    subject: `Your payslip — ${payrunName}`,
    text: `Hi ${employeeName},\n\nYour payslip for ${payrunName} is attached.\n\n— PeoplePay360 Payroll`,
    attachments: [{ filename: `payslip-${payrunName}.pdf`, content: pdfBuffer }],
  })
}
