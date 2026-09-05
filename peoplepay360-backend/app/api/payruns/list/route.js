import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { listPayrunsController } from '@/server/controllers/payrun.controller'

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, PAYROLL_ROLES)
    return await listPayrunsController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
