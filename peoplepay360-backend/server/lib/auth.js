import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions = {
  session: { strategy: 'jwt' },
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
