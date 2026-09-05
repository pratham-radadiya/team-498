import { dashboardFilterSchema } from '../validators/dashboard.validator'
import * as dashboardService from '../services/dashboard.service'

async function parseFilters(request) {
  const body = await request.json().catch(() => ({}))
  return dashboardFilterSchema.parse(body)
}

export async function getKpisController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getKpis(filters))
}

export async function getSalaryByDepartmentController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getSalaryByDepartment(filters))
}

export async function getSalaryTrendController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getSalaryTrend(filters))
}

export async function getAttendanceOverviewController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getAttendanceOverview(filters))
}

export async function getTimeOffOverviewController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getTimeOffOverview(filters))
}

export async function getDepartmentOverviewController(request) {
  const filters = await parseFilters(request)
  return Response.json(await dashboardService.getDepartmentOverview(filters))
}
