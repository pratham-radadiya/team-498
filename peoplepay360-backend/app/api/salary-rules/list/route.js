import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { listSalaryRulesController } from '@/server/controllers/salaryRule.controller'

const READ_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, READ_ROLES)
    return await listSalaryRulesController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
