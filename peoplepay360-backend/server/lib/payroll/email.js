import nodemailer from 'nodemailer'

let cachedTransport = null

export function getTransport() {
  if (cachedTransport) return cachedTransport

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT ?? 587)
  const isGmail = host.includes('gmail.com')

  if (isGmail && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    cachedTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  } else {
    cachedTransport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
      tls: {
        rejectUnauthorized: false,
      },
    })
  }

  return cachedTransport
}

export async function sendPayslipEmail({ to, employeeName, payrunName, pdfBuffer }) {
  if (!to || typeof to !== 'string' || !to.includes('@')) {
    throw new Error(`Invalid recipient email address: ${to}`)
  }

  const transport = getTransport()
  const fromAddress = process.env.SMTP_FROM || (process.env.SMTP_USER ? `PeoplePay360 <${process.env.SMTP_USER}>` : 'PeoplePay360 <payroll@peoplepay360.com>')

  const cleanPayrunName = String(payrunName || 'payroll').replace(/[^a-zA-Z0-9_-]/g, '_')

  return transport.sendMail({
    from: fromAddress,
    to: to.trim(),
    subject: `Your Payslip — ${payrunName}`,
    text: `Dear ${employeeName || 'Employee'},\n\nPlease find attached your salary payslip for ${payrunName}.\n\nIf you have any questions, please reach out to the HR / Payroll department.\n\nBest regards,\nPeoplePay360 Payroll Team`,
    attachments: [
      {
        filename: `Payslip_${cleanPayrunName}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  })
}

