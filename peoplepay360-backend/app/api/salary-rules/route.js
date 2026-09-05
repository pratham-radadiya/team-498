import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { createSalaryRuleController } from '@/server/controllers/salaryRule.controller'

const WRITE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    return await createSalaryRuleController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
