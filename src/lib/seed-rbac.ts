import { prisma } from '@/lib/prisma'
import { PERMISSION_DEFINITIONS, MANAGER_PERMISSIONS } from '@/lib/permissions'

export async function seedPermissionsAndRoles() {
  const count = await prisma.permission.count()
  if (count === 0) {
    await prisma.permission.createMany({
      data: PERMISSION_DEFINITIONS.map(p => ({ key: p.key, label: p.label, group: p.group })),
      skipDuplicates: true,
    })
    await seedSystemRoles()
  }
}

export async function seedSystemRoles() {
  const allPerms = await prisma.permission.findMany()
  const adminPermIds = allPerms.map(p => p.id)
  const managerPermIds = allPerms
    .filter(p => MANAGER_PERMISSIONS.includes(p.key as any))
    .map(p => p.id)

  const systemRoles = [
    { name: 'ADMIN',    label: 'Administrator', description: 'Full access to all features',       isSystem: true, permIds: adminPermIds   },
    { name: 'MANAGER',  label: 'Manager',       description: 'Access to catalog, orders, content', isSystem: true, permIds: managerPermIds },
    { name: 'CUSTOMER', label: 'Customer',      description: 'Regular store customer, no admin access', isSystem: true, permIds: [] as string[] },
  ]

  for (const { permIds, ...roleData } of systemRoles) {
    const existing = await prisma.role.findUnique({ where: { name: roleData.name } })
    if (!existing) {
      const role = await prisma.role.create({ data: roleData })
      if (permIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permIds.map(permissionId => ({ roleId: role.id, permissionId })),
        })
      }
    }
  }
}
