import { NextResponse } from 'next/server'

// Fast edge-level reject when there's no session cookie at all. This is a
// first-pass optimization only — withAuth() inside each route is the
// authoritative check (it re-validates the session against the DB), since
// proxy matchers can be bypassed or misconfigured.
export function proxy(request) {
  const hasSessionCookie =
    request.cookies.has('next-auth.session-token') ||
    request.cookies.has('__Secure-next-auth.session-token')

  if (!hasSessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/((?!auth).*)'],
}
