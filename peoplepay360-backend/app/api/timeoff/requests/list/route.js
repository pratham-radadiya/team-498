import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listTimeOffRequestsController } from '@/server/controllers/timeOffRequest.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listTimeOffRequestsController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
