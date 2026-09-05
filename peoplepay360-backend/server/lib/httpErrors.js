import { ZodError } from 'zod'
import { UnauthorizedError, ForbiddenError } from '../rbac/guards'

export class NotFoundError extends Error {}
export class ConflictError extends Error {}

// Central place every controller funnels caught errors through, so status
// codes stay consistent across all modules (see nodejs-best-practices skill's
// status-code table): 401 auth, 403 role, 400 validation, 404 missing, 409 conflict.
export function handleApiError(err) {
  if (err instanceof UnauthorizedError) {
    return Response.json({ error: err.message }, { status: 401 })
  }
  if (err instanceof ForbiddenError) {
    return Response.json({ error: err.message }, { status: 403 })
  }
  if (err instanceof ZodError) {
    return Response.json({ error: 'Validation failed', details: err.issues }, { status: 400 })
  }
  if (err instanceof NotFoundError) {
    return Response.json({ error: err.message }, { status: 404 })
  }
  if (err instanceof ConflictError) {
    return Response.json({ error: err.message }, { status: 409 })
  }
  console.error(err)
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
