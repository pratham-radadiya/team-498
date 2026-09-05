import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listContractsController } from '@/server/controllers/contract.controller'

// Reuses the contract grid contract (POST body: startRow/endRow/sortModel/filterModel)
// but forces the employeeId filter to this route's [id], regardless of what the
// client's filterModel says — this is what the Employee Form's "Contracts" smart
// button hits.
export async function POST(request, { params }) {
  try {
    const session = await withAuth()
    const { id } = await params
    return await listContractsController(request, session, { forcedEmployeeId: id })
  } catch (err) {
    return handleApiError(err)
  }
}
