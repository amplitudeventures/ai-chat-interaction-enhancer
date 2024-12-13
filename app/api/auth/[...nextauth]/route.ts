import NextAuth, { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { authOptions } from '../auth-config'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }