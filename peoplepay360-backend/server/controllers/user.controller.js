import { createUserSchema, updateUserSchema } from '../validators/user.validator'
import * as userService from '../services/user.service'

export async function createUserController(request) {
  const body = await request.json()
  const data = createUserSchema.parse(body)
  const user = await userService.createUser(data)
  return Response.json(
    { id: user.id, email: user.email, role: user.role, status: user.status, employeeId: user.employeeId },
    { status: 201 }
  )
}

export async function updateUserController(request, id, session) {
  const body = await request.json()
  const data = updateUserSchema.parse(body)
  const user = await userService.updateUser(id, data, session)
  return Response.json(
    { id: user.id, email: user.email, role: user.role, status: user.status, employeeId: user.employeeId }
  )
}

export async function listUsersController() {
  const users = await userService.listUsers()
  return Response.json(users)
}
