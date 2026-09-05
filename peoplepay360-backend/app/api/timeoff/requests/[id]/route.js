import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import {
  getTimeOffRequestController,
  deleteTimeOffRequestController,
} from '@/server/controllers/timeOffRequest.controller'

const NON_EMPLOYEE_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    const { id } = await params
    return await getTimeOffRequestController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await deleteTimeOffRequestController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
