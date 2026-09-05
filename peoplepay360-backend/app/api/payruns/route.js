import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { createPayrunController } from '@/server/controllers/payrun.controller'

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

// Wizard step 2's final "Create Payrun" click — persists the batch with
// exactly the selected employees. Step 1's scope data never gets persisted
// on its own.
export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, PAYROLL_ROLES)
    return await createPayrunController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
