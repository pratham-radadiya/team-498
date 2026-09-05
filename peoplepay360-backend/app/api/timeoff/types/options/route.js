import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listTimeOffTypeOptionsController } from '@/server/controllers/timeOffType.controller'

export async function GET() {
  try {
    await withAuth()
    return await listTimeOffTypeOptionsController()
  } catch (err) {
    return handleApiError(err)
  }
}
