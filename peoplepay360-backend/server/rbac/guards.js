import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import { prisma } from '../lib/prisma'

export class UnauthorizedError extends Error {}
export class ForbiddenError extends Error {}

// Re-checks the user against the DB on every call — never trusts the JWT payload
// alone, so a user deactivated by Admin is rejected on their very next request.
export async function resolveActiveUser(userId) {
  if (!userId) {
    throw new UnauthorizedError('Not authenticated')
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.status !== 'Active') {
    throw new UnauthorizedError('User not found or inactive')
  }
  return { userId: user.id, employeeId: user.employeeId, role: user.role }
}

// Called as the first line of every route handler (except /api/auth/*).
export async function withAuth() {
  const session = await getServerSession(authOptions)
  return resolveActiveUser(session?.user?.userId)
}

export function requireRole(session, allowedRoles) {
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError('Insufficient role for this action')
  }
}
