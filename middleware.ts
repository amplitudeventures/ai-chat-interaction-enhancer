import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    // Always allow access to home page
    if (req.nextUrl.pathname === '/') {
      return null
    }

    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register')

    if (isAuthPage) {
      if (req.nextauth.token) {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      return null
    }

    // Protect other routes
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  },
  {
    callbacks: {
      authorized: () => true // Let the middleware function handle the auth check
    }
  }
)

// Simplify the matcher
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
