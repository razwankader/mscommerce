// All permission keys used by the app
export const PERMISSION_DEFINITIONS = [
  { key: 'dashboard.view',      label: 'View Dashboard',              group: 'General'         },
  { key: 'products.manage',     label: 'Manage Products',             group: 'Catalog'         },
  { key: 'products.barcode',    label: 'View Product Barcodes',       group: 'Catalog'         },
  { key: 'categories.manage',   label: 'Manage Categories',           group: 'Catalog'         },
  { key: 'brands.manage',       label: 'Manage Brands',               group: 'Catalog'         },
  { key: 'orders.manage',       label: 'Manage Orders',               group: 'Orders & Stock'  },
  { key: 'stock.manage',        label: 'Manage Stock',                group: 'Orders & Stock'  },
  { key: 'banners.manage',      label: 'Manage Banners',              group: 'Content'         },
  { key: 'pages.manage',        label: 'Manage Pages',                group: 'Content'         },
  { key: 'users.manage',        label: 'Manage Users',                group: 'Administration'  },
  { key: 'roles.manage',        label: 'Manage Roles & Permissions',  group: 'Administration'  },
  { key: 'settings.manage',     label: 'Manage Settings',             group: 'Administration'  },
] as const

export type PermissionKey = typeof PERMISSION_DEFINITIONS[number]['key']

// Default permissions for system roles (used during DB seeding)
export const ADMIN_PERMISSIONS: PermissionKey[] = PERMISSION_DEFINITIONS.map(p => p.key)
export const MANAGER_PERMISSIONS: PermissionKey[] = [
  'dashboard.view', 'products.manage', 'products.barcode', 'categories.manage', 'brands.manage',
  'orders.manage', 'stock.manage', 'banners.manage', 'pages.manage',
]

// Route prefix → required permission (checked in middleware)
export const ROUTE_PERMISSION_MAP: { prefix: string; permission: PermissionKey }[] = [
  { prefix: '/admin/roles',      permission: 'roles.manage'      },
  { prefix: '/admin/users',      permission: 'users.manage'      },
  { prefix: '/admin/settings',   permission: 'settings.manage'   },
  { prefix: '/admin/products',   permission: 'products.manage'   },
  { prefix: '/admin/categories', permission: 'categories.manage' },
  { prefix: '/admin/brands',     permission: 'brands.manage'     },
  { prefix: '/admin/orders',     permission: 'orders.manage'     },
  { prefix: '/admin/stock',      permission: 'stock.manage'      },
  { prefix: '/admin/banners',    permission: 'banners.manage'    },
  { prefix: '/admin/pages',      permission: 'pages.manage'      },
]

export function hasPermission(permissions: string[], key: PermissionKey): boolean {
  return permissions.includes(key)
}

export function canAccessRoute(permissions: string[], pathname: string): boolean {
  if (pathname === '/admin') return permissions.length > 0
  const match = ROUTE_PERMISSION_MAP.find(r => pathname.startsWith(r.prefix))
  if (!match) return true // unknown route → allow
  return permissions.includes(match.permission)
}
