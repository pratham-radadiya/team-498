import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import { createEmployeeController } from '@/server/controllers/employee.controller'

// Creating an Employee now also provisions its login credentials and role
// (Employee IS the login account) — restricted to Admin only, same as the
// old Users module was.
export async function POST(request) {
  try {
    const session = await withAuth()
    requireRole(session, [ROLES.ADMIN])
    return await createEmployeeController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
