import type { AuthOptions } from 'next-auth'
import Credentials from "next-auth/providers/credentials"

export const authConfig: AuthOptions = {
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        return null
      }
    })
  ],
  pages: {
    signIn: '/login',
    signOut: '/'
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Always redirect to home page after sign out
      if (url.startsWith('/login')) {
        return baseUrl
      }
      return url
    }
  }
} 