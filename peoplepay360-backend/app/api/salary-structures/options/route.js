import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { listSalaryStructureOptionsController } from '@/server/controllers/salaryStructure.controller'

const READ_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET() {
  try {
    const session = await withAuth()
    requireRole(session, READ_ROLES)
    return await listSalaryStructureOptionsController()
  } catch (err) {
    return handleApiError(err)
  }
}
