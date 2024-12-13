import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: '/login'
    }
  }
)

export const config = {
  matcher: [
    // Add routes that need authentication
    '/dashboard/:path*',
    '/settings/:path*',
    // Exclude chatcenter
    '/((?!chatcenter|login|register|api|_next/static|_next/image|favicon.ico).*)'
  ]
}
