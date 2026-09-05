import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listAttendanceController } from '@/server/controllers/attendance.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listAttendanceController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
