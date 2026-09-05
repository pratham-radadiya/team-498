import { withAuth } from '@/server/rbac/guards'
import { handleApiError } from '@/server/lib/httpErrors'
import { listContractsController } from '@/server/controllers/contract.controller'

export async function POST(request) {
  try {
    const session = await withAuth()
    return await listContractsController(request, session)
  } catch (err) {
    return handleApiError(err)
  }
}
