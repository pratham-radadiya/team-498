import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listWorkingSchedulesController } from '@/server/controllers/workingSchedule.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listWorkingSchedulesController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
