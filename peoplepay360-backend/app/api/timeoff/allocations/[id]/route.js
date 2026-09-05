import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import {
  getAllocationController,
  updateAllocationController,
  deleteAllocationController,
} from '@/server/controllers/allocation.controller'

const NON_EMPLOYEE_ROLES = [ROLES.HR_MANAGER, ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    const { id } = await params
    return await getAllocationController(id, session)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await updateAllocationController(request, id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, NON_EMPLOYEE_ROLES)
    const { id } = await params
    return await deleteAllocationController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
