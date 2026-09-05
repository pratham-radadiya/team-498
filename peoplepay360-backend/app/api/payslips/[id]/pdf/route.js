import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { getPayslipPdfController } from '@/server/controllers/payslip.controller'

const ALLOWED_ROLES = [ROLES.EMPLOYEE, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, ALLOWED_ROLES)
    const { id } = await params
    return await getPayslipPdfController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}
