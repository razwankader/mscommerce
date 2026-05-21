import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { seedPermissionsAndRoles } from '@/lib/seed-rbac'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const isAdmin = session.user.role === 'ADMIN'
  const hasRolesManage = session.user.permissions?.includes('roles.manage')
  if (!isAdmin && !hasRolesManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Auto-seed permissions + system roles on first run
  await seedPermissionsAndRoles()

  const permissions = await prisma.permission.findMany({
    orderBy: [{ group: 'asc' }, { label: 'asc' }],
  })
  return NextResponse.json(permissions)
}
