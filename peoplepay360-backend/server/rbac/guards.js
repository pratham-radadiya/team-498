import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import { prisma } from '../lib/prisma'

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

// Re-checks the employee against the DB on every call — never trusts the JWT
// payload alone, so someone deactivated by Admin is rejected on their very
// next request.
export async function resolveActiveEmployee(employeeId) {
  if (!employeeId) {
    throw new UnauthorizedError('Not authenticated')
  }
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee || employee.status !== 'Active') {
    throw new UnauthorizedError('Employee not found or inactive')
  }
  return { employeeId: employee.id, role: employee.role }
}

// Called as the first line of every route handler (except /api/auth/*).
export async function withAuth() {
  const session = await getServerSession(authOptions)
  return resolveActiveEmployee(session?.user?.employeeId)
}

export function requireRole(session, allowedRoles) {
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError('Insufficient role for this action')
  }
}
