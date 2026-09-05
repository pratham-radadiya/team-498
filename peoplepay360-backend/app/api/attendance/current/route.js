import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { getCurrentAttendanceController } from '@/server/controllers/attendance.controller'

export async function GET(request) {
  try {
    const session = await withAuth()
    return await getCurrentAttendanceController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
