import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { seedSystemRoles } from '../permissions/route'

function requireRolesManage(session: any) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = session.user.role === 'ADMIN'
  const hasRolesManage = session.user.permissions?.includes('roles.manage')
  if (!isAdmin && !hasRolesManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET() {
  const session = await auth()
  const denied = requireRolesManage(session)
  if (denied) return denied

  // Auto-seed if first run
  const permCount = await prisma.permission.count()
  if (permCount === 0) {
    await prisma.permission.createMany({
      data: (await import('@/lib/permissions')).PERMISSION_DEFINITIONS.map(p => ({
        key: p.key,
        label: p.label,
        group: p.group,
      })),
      skipDuplicates: true,
    })
    await seedSystemRoles()
  }

  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Get user counts per role name
  const userCounts = await prisma.user.groupBy({
    by: ['role'],
    _count: { id: true },
  })
  const userCountMap = Object.fromEntries(userCounts.map(r => [r.role, r._count.id]))

  const result = roles.map(role => ({
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    permissions: role.permissions.map(rp => rp.permission.key),
    userCount: userCountMap[role.name] ?? 0,
  }))

  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const denied = requireRolesManage(session)
  if (denied) return denied

  const body = await req.json()
  const { name, label, description, permissions } = body

  if (!name || !label) {
    return NextResponse.json({ error: 'Name and label are required' }, { status: 400 })
  }

  // Validate name: uppercase, alphanumeric + underscore only
  if (!/^[A-Z0-9_]+$/.test(name)) {
    return NextResponse.json(
      { error: 'Role name must be uppercase letters, numbers, and underscores only' },
      { status: 400 }
    )
  }

  // Check uniqueness
  const existing = await prisma.role.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json({ error: 'A role with this name already exists' }, { status: 409 })
  }

  // Resolve permission IDs from keys
  const permKeys: string[] = Array.isArray(permissions) ? permissions : []
  const permRecords = permKeys.length > 0
    ? await prisma.permission.findMany({ where: { key: { in: permKeys } } })
    : []

  const role = await prisma.role.create({
    data: {
      name,
      label,
      description: description || null,
      isSystem: false,
      permissions: {
        create: permRecords.map(p => ({ permissionId: p.id })),
      },
    },
    include: {
      permissions: { include: { permission: true } },
    },
  })

  return NextResponse.json({
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    permissions: role.permissions.map(rp => rp.permission.key),
    userCount: 0,
  }, { status: 201 })
}
