import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listAllocationsController } from '@/server/controllers/allocation.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listAllocationsController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
