import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { createTimeOffRequestController } from '@/server/controllers/timeOffRequest.controller'

// Every role may create a request — EMPLOYEE creates their own (per the
// permission matrix); HR roles may create one on behalf of another employee.
export async function POST(request) {
  try {
    const session = await withAuth()
    return await createTimeOffRequestController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
