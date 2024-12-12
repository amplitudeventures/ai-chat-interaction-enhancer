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
    signOut: '/'  // Add this line to redirect to index after logout

  }
} 