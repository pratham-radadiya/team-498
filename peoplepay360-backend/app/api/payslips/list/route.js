import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { listPayslipsController } from '@/server/controllers/payslip.controller'

// Employee may list (scoped to their own, enforced in the service); HR
// Manager has no access at all per the matrix.
const ALLOWED_ROLES = [ROLES.EMPLOYEE, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, ALLOWED_ROLES)
    return await listPayslipsController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
