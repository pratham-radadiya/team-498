import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listEmployeeOptionsController } from '@/server/controllers/employee.controller'

export async function GET() {
  try {
    await withAuth()
    return await listEmployeeOptionsController()
  } catch (err) {
    return handleApiError(err)
  }
}
