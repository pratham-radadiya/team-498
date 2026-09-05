import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listEmployeesController } from '@/server/controllers/employee.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listEmployeesController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
