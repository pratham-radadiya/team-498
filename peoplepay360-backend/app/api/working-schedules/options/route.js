import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listWorkingScheduleOptionsController } from '@/server/controllers/workingSchedule.controller'

export async function GET() {
  try {
    await withAuth()
    return await listWorkingScheduleOptionsController()
  } catch (err) {
    return handleApiError(err)
  }
}
