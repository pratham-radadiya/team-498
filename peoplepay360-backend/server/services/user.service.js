import bcrypt from 'bcryptjs'
import { ForbiddenError } from '../rbac/guards'
import { ConflictError, NotFoundError } from '../lib/httpErrors'
import * as userRepo from '../repositories/user.repository'
import * as employeeRepo from '../repositories/employee.repository'

export async function createUser(data) {
  const employee = await employeeRepo.findEmployeeById(data.employeeId)
  if (!employee) throw new NotFoundError('Linked employee not found')

  const existing = await userRepo.findUserByEmployeeId(data.employeeId)
  if (existing) throw new ConflictError('This employee already has a user account')

  const passwordHash = await bcrypt.hash(data.password, 10)

  return userRepo.createUser({
    email: data.email,
    passwordHash,
    role: data.role,
    employeeId: data.employeeId,
    status: data.status ?? 'Active',
  })
}

// A user can never change their own role — enforced here regardless of what
// the request body contains, independent of the update* Zod schema.
export async function updateUser(targetUserId, data, session) {
  if (targetUserId === session.userId && 'role' in data) {
    throw new ForbiddenError('You cannot change your own role')
  }
  const user = await userRepo.findUserById(targetUserId)
  if (!user) throw new NotFoundError('User not found')
  return userRepo.updateUser(targetUserId, data)
}

export async function listUsers() {
  return userRepo.listUsers()
}
