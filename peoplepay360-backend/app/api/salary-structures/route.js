import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { createSalaryStructureController } from '@/server/controllers/salaryStructure.controller'

const WRITE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    return await createSalaryStructureController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
