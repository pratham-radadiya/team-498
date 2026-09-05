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

        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (!user || user.status !== 'Active') return null

        const passwordValid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!passwordValid) return null

        return { id: user.id, email: user.email, role: user.role, employeeId: user.employeeId }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id
        token.role = user.role
        token.employeeId = user.employeeId
      }
      return token
    },
    async session({ session, token }) {
      session.user.userId = token.userId
      session.user.role = token.role
      session.user.employeeId = token.employeeId
      return session
    },
  },
}
