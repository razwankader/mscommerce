import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

function requireRolesManage(session: any) {
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const isAdmin = session.user.role === 'ADMIN'
  const hasRolesManage = session.user.permissions?.includes('roles.manage')
  if (!isAdmin && !hasRolesManage) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return null
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const denied = requireRolesManage(session)
  if (denied) return denied

  const { id } = await params
  const role = await prisma.role.findUnique({
    where: { id },
    include: { permissions: { include: { permission: true } } },
  })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const userCount = await prisma.user.count({ where: { role: role.name } })

  return NextResponse.json({
    id: role.id,
    name: role.name,
    label: role.label,
    description: role.description,
    isSystem: role.isSystem,
    createdAt: role.createdAt,
    permissions: role.permissions.map(rp => rp.permission.key),
    userCount,
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const denied = requireRolesManage(session)
  if (denied) return denied

  const { id } = await params
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { label, description, permissions } = body

  if (!label) {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  }

  // Resolve new permission IDs from keys
  const permKeys: string[] = Array.isArray(permissions) ? permissions : []
  const permRecords = permKeys.length > 0
    ? await prisma.permission.findMany({ where: { key: { in: permKeys } } })
    : []

  // Replace all permissions for this role
  await prisma.rolePermission.deleteMany({ where: { roleId: id } })

  const updated = await prisma.role.update({
    where: { id },
    data: {
      // Only update name if not a system role
      label,
      description: description ?? null,
      permissions: {
        create: permRecords.map(p => ({ permissionId: p.id })),
      },
    },
    include: { permissions: { include: { permission: true } } },
  })

  const userCount = await prisma.user.count({ where: { role: updated.name } })

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    label: updated.label,
    description: updated.description,
    isSystem: updated.isSystem,
    createdAt: updated.createdAt,
    permissions: updated.permissions.map(rp => rp.permission.key),
    userCount,
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const denied = requireRolesManage(session)
  if (denied) return denied

  const { id } = await params
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (role.isSystem) {
    return NextResponse.json({ error: 'System roles cannot be deleted' }, { status: 400 })
  }

  const userCount = await prisma.user.count({ where: { role: role.name } })
  if (userCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete role: ${userCount} user(s) are assigned to it` },
      { status: 400 }
    )
  }

  await prisma.role.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
