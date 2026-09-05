import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import {
  getWorkingScheduleController,
  updateWorkingScheduleController,
  deleteWorkingScheduleController,
} from '@/server/controllers/workingSchedule.controller'

const NON_EMPLOYEE_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    const { id } = await params
    return await getWorkingScheduleController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await updateWorkingScheduleController(request, id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await deleteWorkingScheduleController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
