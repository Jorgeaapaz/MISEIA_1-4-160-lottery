import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// JWT lives in localStorage — the proxy cannot access it.
// Page-level auth protection is handled client-side via GlobalContext.
// This proxy only handles concerns that are available server-side.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Block direct access to API routes that require admin without a token
  // (API routes already validate this themselves, so this is just a passthrough)
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
