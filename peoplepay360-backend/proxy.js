import { NextResponse } from 'next/server'

// Dev-mode CORS: reflects whatever Origin the request came from (rather than
// a fixed whitelist) so the backend can be tested from a frontend running on
// a different machine/port (e.g. via a devtunnel), while still restricting
// exactly which origin gets the credentialed response — never a bare "*",
// which browsers reject for credentialed requests anyway.
function applyCorsHeaders(response, origin) {
  if (!origin) return response
  response.headers.set('Access-Control-Allow-Origin', origin)
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

// Fast edge-level reject when there's no session cookie at all. This is a
// first-pass optimization only — withAuth() inside each route is the
// authoritative check (it re-validates the session against the DB), since
// proxy matchers can be bypassed or misconfigured.
export function proxy(request) {
  const origin = request.headers.get('origin')

  // CORS preflight — answer directly, no auth check applies to OPTIONS.
  if (request.method === 'OPTIONS') {
    return applyCorsHeaders(new NextResponse(null, { status: 204 }), origin)
  }

  const isAuthPath = request.nextUrl.pathname.startsWith('/api/auth')
  if (!isAuthPath) {
    const hasSessionCookie =
      request.cookies.has('next-auth.session-token') ||
      request.cookies.has('__Secure-next-auth.session-token')

    if (!hasSessionCookie) {
      return applyCorsHeaders(NextResponse.json({ error: 'Not authenticated' }, { status: 401 }), origin)
    }
  }

  return applyCorsHeaders(NextResponse.next(), origin)
}

export const config = {
  matcher: ['/api/:path*'],
}
