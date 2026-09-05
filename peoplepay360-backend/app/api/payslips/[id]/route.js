import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { getPayslipController, deletePayslipController } from '@/server/controllers/payslip.controller'

const ALLOWED_ROLES = [ROLES.EMPLOYEE, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]
const DELETE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, ALLOWED_ROLES)
    const { id } = await params
    return await getPayslipController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, DELETE_ROLES)
    const { id } = await params
    return await deletePayslipController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}
