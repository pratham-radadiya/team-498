import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions = {
  session: { strategy: 'jwt' },
  // sameSite:'lax' (NextAuth's default) is never sent by browsers on
  // cross-origin XHR/fetch at all, regardless of CORS headers — needed here
  // because the frontend runs on a different machine/origin than this
  // backend (accessed via a tunnel). 'none' requires 'secure: true' (HTTPS),
  // which the tunnel provides; a real production deploy should keep this,
  // since it'll be HTTPS there too.
  cookies: {
    sessionToken: { name: 'next-auth.session-token', options: { httpOnly: true, sameSite: 'none', path: '/', secure: true } },
    callbackUrl: { name: 'next-auth.callback-url', options: { sameSite: 'none', path: '/', secure: true } },
    csrfToken: { name: 'next-auth.csrf-token', options: { httpOnly: true, sameSite: 'none', path: '/', secure: true } },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        // Employee IS the login account — no separate User table.
        const employee = await prisma.employee.findUnique({ where: { email: credentials.email } })
        if (!employee || employee.status !== 'Active') return null

        const passwordValid = await bcrypt.compare(credentials.password, employee.passwordHash)
        if (!passwordValid) return null

        return { id: employee.id, email: employee.email, role: employee.role }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.employeeId = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (!token?.employeeId) {
        return { ...session, user: null }
      }
      const employee = await prisma.employee.findUnique({
        where: { id: token.employeeId },
        select: { id: true, name: true, email: true, role: true, status: true },
      })
      if (!employee || employee.status !== 'Active') {
        return { ...session, user: null }
      }
      session.user.employeeId = employee.id
      session.user.role = employee.role
      session.user.name = employee.name
      session.user.email = employee.email
      return session
    },
  },
}
