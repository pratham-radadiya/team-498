import { withAuth, requireRole } from '@/server/rbac/guards'
import { ROLES } from '@/server/rbac/roles'
import { handleApiError } from '@/server/lib/httpErrors'
import {
  getSalaryRuleController,
  updateSalaryRuleController,
  deleteSalaryRuleController,
} from '@/server/controllers/salaryRule.controller'

const READ_ROLES = [ROLES.HR_PAYROLL_USER, ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]
const WRITE_ROLES = [ROLES.HR_PAYROLL_MANAGER, ROLES.ADMIN]

export async function GET(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, READ_ROLES)
    const { id } = await params
    return await getSalaryRuleController(id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    const { id } = await params
    return await updateSalaryRuleController(request, id)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await withAuth()
    requireRole(session, WRITE_ROLES)
    const { id } = await params
    return await deleteSalaryRuleController(id)
  } catch (err) {
    return handleApiError(err)
  }
}
