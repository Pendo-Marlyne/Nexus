import { NextResponse, type NextRequest } from 'next/server'

const protectedPrefixes = ['/dashboard', '/projects', '/tasks', '/analytics']
const adminOnlyPrefixes = ['/admin', '/settings/security']

/**
 * Next middleware for route protection.
 * Reads auth/role cookies issued by your auth session layer.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const authUid = request.cookies.get('helix_uid')?.value
  const role = request.cookies.get('helix_role')?.value

  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAdminOnly = adminOnlyPrefixes.some((prefix) => pathname.startsWith(prefix))

  if (isProtected && !authUid) {
    const url = new URL('/auth/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAdminOnly && !['owner', 'admin'].includes(role ?? '')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/tasks/:path*', '/analytics/:path*', '/admin/:path*'],
}

