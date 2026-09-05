import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { eligibleEmployeesController } from '@/server/controllers/payrun.controller'

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

// Small necessary addition, not in the plan's literal route list: the wizard's
// step 2 ("filters eligible staff for explicit user selection") needs
// something to populate that checkbox table with, before a Payrun exists.
export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, PAYROLL_ROLES)
    return await eligibleEmployeesController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
