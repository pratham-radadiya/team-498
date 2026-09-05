import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { getPayrunController, deletePayrunController } from '@/server/controllers/payrun.controller'

const PAYROLL_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]
const DELETE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN] // HR Payroll User: no Delete, per the matrix

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, PAYROLL_ROLES)
    const { id } = await params
    return await getPayrunController(id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, DELETE_ROLES)
    const { id } = await params
    return await deletePayrunController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}
