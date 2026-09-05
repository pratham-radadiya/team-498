import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { createUserController, listUsersController } from '@/server/controllers/user.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, [ROLES.ADMIN])
    return await createUserController(request)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function GET() {
  try {
    const session = await withAuth()
    requireRole(session, [ROLES.ADMIN])
    return await listUsersController()
  } catch (err) {
    return handleApiError(err)
  }
}
