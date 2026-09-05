import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { addRulesToSalaryStructureController } from '@/server/controllers/salaryStructure.controller'

const WRITE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    const { id } = await params
    return await addRulesToSalaryStructureController(request, id)
  } catch (err) {
    return handleApiError(err)
  }
}
