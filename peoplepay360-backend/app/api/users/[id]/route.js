import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError, NotFoundError } from '@/server/lib/httpErrors'
import { updateUserController } from '@/server/controllers/user.controller'
import { findUserById } from '@/server/repositories/user.repository'

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, [ROLES.ADMIN])
    const { id } = await params
    const user = await findUserById(id)
    if (!user) throw new NotFoundError('User not found')
    return Response.json({ id: user.id, email: user.email, role: user.role, status: user.status, employeeId: user.employeeId })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, [ROLES.ADMIN])
    const { id } = await params
    return await updateUserController(request, id, session)
  } catch (err) {
    return handleApiError(err)
  }
}
