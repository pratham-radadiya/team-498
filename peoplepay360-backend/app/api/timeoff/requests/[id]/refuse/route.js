import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { refuseTimeOffRequestController } from '@/server/controllers/timeOffRequest.controller'

const NON_EMPLOYEE_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await refuseTimeOffRequestController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}
