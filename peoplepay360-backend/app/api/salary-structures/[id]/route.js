import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import {
  getSalaryStructureController,
  updateSalaryStructureController,
  deleteSalaryStructureController,
} from '@/server/controllers/salaryStructure.controller'

const READ_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]
const WRITE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, READ_ROLES)
    const { id } = await params
    return await getSalaryStructureController(id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    const { id } = await params
    return await updateSalaryStructureController(request, id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    const { id } = await params
    return await deleteSalaryStructureController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
