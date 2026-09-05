import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { sendPayslipsController } from '@/server/controllers/payrun.controller'

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function POST(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, PAYROLL_ROLES)
    const { id } = await params
    return await sendPayslipsController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
