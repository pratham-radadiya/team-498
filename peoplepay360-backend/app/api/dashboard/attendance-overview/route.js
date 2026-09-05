import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { getAttendanceOverviewController } from '@/server/controllers/dashboard.controller'

const DASHBOARD_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, DASHBOARD_ROLES)
    return await getAttendanceOverviewController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
