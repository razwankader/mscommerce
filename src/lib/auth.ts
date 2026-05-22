import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const userWithRole = {
  include: {
    roleRef: {
      include: { permissions: { include: { permission: true } } },
    },
  },
} as const

// Extend PrismaAdapter to assign CUSTOMER role on OAuth user creation
// (PrismaAdapter doesn't know about our required roleId FK)
function buildAdapter() {
  const base = PrismaAdapter(prisma)
  return {
    ...base,
    async createUser(data: Parameters<NonNullable<typeof base.createUser>>[0]) {
      const customerRole = await prisma.role.findUnique({ where: { name: 'CUSTOMER' } })
      return base.createUser!({ ...data, roleId: customerRole?.id } as any)
    },
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: buildAdapter(),
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { roleRef: { select: { name: true } } },
        })

        if (!user || !user.isActive || !user.password) return null

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        if (!passwordMatch) return null

        return { id: user.id, name: user.name, email: user.email, role: user.roleRef?.name ?? 'CUSTOMER' }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          ...userWithRole,
        })
        token.role = dbUser?.roleRef?.name ?? 'CUSTOMER'
        token.roleId = dbUser?.roleId ?? null
        token.id = dbUser?.id ?? user.id
        token.permissions = dbUser?.roleRef?.permissions.map(rp => rp.permission.key) ?? []
      }

      // Back-fill missing fields for sessions issued before RBAC was added
      if (!token.role || !token.permissions) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          ...userWithRole,
        }).catch(() => null)
        if (dbUser) {
          token.role = dbUser.roleRef?.name ?? 'CUSTOMER'
          token.roleId = dbUser.roleId ?? null
          token.permissions = dbUser.roleRef?.permissions.map(rp => rp.permission.key) ?? []
        }
      }

      if (trigger === 'update' && session) {
        if (session.name) token.name = session.name
        if (session.image) token.picture = session.image
        if (session.refreshPermissions) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            ...userWithRole,
          })
          token.role = dbUser?.roleRef?.name ?? 'CUSTOMER'
          token.roleId = dbUser?.roleId ?? null
          token.permissions = dbUser?.roleRef?.permissions.map(rp => rp.permission.key) ?? []
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.roleId = token.roleId as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider !== 'credentials') {
        const existing = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { roleRef: { select: { name: true } } },
        })
        // Block OAuth login for admin/manager accounts
        if (existing && ['ADMIN', 'MANAGER'].includes(existing.roleRef?.name ?? '')) return false
        if (!user.name) user.name = user.email!.split('@')[0]
      }
      return true
    },
  },
  pages: {
    signIn: '/account/login',
  },
})
