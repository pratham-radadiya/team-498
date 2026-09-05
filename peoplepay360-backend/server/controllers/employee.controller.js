import { createEmployeeSchema, updateEmployeeSchema, employeeListRequestSchema } from '../validators/employee.validator'
import * as employeeService from '../services/employee.service'

export async function createEmployeeController(request) {
  const body = await request.json()
  const data = createEmployeeSchema.parse(body)
  const employee = await employeeService.createEmployee(data)
  return Response.json(employee, { status: 201 })
}

export async function getEmployeeController(id, session) {
  const employee = await employeeService.getEmployee(id, session)
  return Response.json(employee)
}

export async function updateEmployeeController(request, id, session) {
  const body = await request.json()
  const data = updateEmployeeSchema.parse(body)
  const employee = await employeeService.updateEmployee(id, data, session)
  return Response.json(employee)
}

export async function deleteEmployeeController(id) {
  await employeeService.deleteEmployee(id)
  return new Response(null, { status: 204 })
}

export async function listEmployeesController(request, session) {
  const body = await request.json()
  const gridRequest = employeeListRequestSchema.parse(body)
  const result = await employeeService.listEmployeesGrid(gridRequest, session)
  return Response.json(result)
}

export async function listEmployeeOptionsController() {
  const options = await employeeService.listEmployeeOptions()
  return Response.json(options.map((e) => ({ id: e.id, label: e.name })))
}
