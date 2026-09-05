import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

// Written with React.createElement instead of JSX: this file is plain .js
// (not .jsx), and this keeps PDF generation independent of whether the
// project's build toolchain is configured to parse JSX in arbitrary .js
// files under app/ or server/ — createElement is always valid JS.
const e = React.createElement

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, fontFamily: 'Helvetica' },
  title: { fontSize: 18, marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#555', marginBottom: 16 },
  section: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottom: '1 solid #eee' },
  label: { color: '#555' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: '2 solid #333', paddingBottom: 4, marginBottom: 4 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', borderTop: '2 solid #333', paddingTop: 6, marginTop: 6 },
  bold: { fontFamily: 'Helvetica-Bold' },
})

function money(n) {
  return (n ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function PayslipDocument({ payslip = {}, employee = {}, payrun = {} }) {
  const empName = employee?.name || payslip?.employeeName || 'Employee'
  const empEmail = employee?.email || '—'
  const payrunName = payrun?.name || 'Payrun'
  const pStart = payrun?.periodStart || payslip?.periodStart
  const pEnd = payrun?.periodEnd || payslip?.periodEnd
  const periodStr = pStart && pEnd
    ? `${new Date(pStart).toLocaleDateString()} to ${new Date(pEnd).toLocaleDateString()}`
    : 'Current Period'

  return e(
    Document,
    null,
    e(
      Page,
      { size: 'A4', style: styles.page },
      e(Text, { style: styles.title }, 'Payslip'),
      e(Text, { style: styles.subtitle }, `${payrunName} — ${periodStr}`),
      e(
        View,
        { style: styles.section },
        e(View, { style: styles.row }, e(Text, { style: styles.label }, 'Employee'), e(Text, null, empName)),
        e(View, { style: styles.row }, e(Text, { style: styles.label }, 'Employee Email'), e(Text, null, empEmail)),
        e(View, { style: styles.row }, e(Text, { style: styles.label }, 'Worked Days'), e(Text, null, String(payslip.workedDays ?? '-'))),
        e(View, { style: styles.row }, e(Text, { style: styles.label }, 'Status'), e(Text, null, payslip.status || 'Draft'))
      ),
      e(
        View,
        { style: styles.section },
        e(View, { style: styles.headerRow }, e(Text, { style: styles.bold }, 'Component'), e(Text, { style: styles.bold }, 'Amount')),
        ...(payslip.lines ?? []).map((line, i) =>
          e(View, { style: styles.row, key: i }, e(Text, null, `${line.name} (${line.category})`), e(Text, null, money(line.amount)))
        ),
        e(View, { style: styles.totalRow }, e(Text, { style: styles.bold }, 'Net Salary'), e(Text, { style: styles.bold }, money(payslip.net)))
      )
    )
  )
}
