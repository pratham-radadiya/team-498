import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listTimeOffTypesController } from '@/server/controllers/timeOffType.controller'

export async function POST(request) {
  try {
    await withAuth()
    return await listTimeOffTypesController(request)
  } catch (err) {
    return handleApiError(err)
  }
}
