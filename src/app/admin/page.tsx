export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { StatCard } from '@/components/admin/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Users, Package, DollarSign, ShieldOff } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'

async function getDashboardData() {
  const [
    totalOrders,
    totalUsers,
    totalProducts,
    revenueResult,
    recentOrders,
    topProducts,
    pendingOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { roleRef: { name: 'CUSTOMER' } } }),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.aggregate({
      where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } },
      _sum: { total: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { orderItems: { include: { product: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ])

  const productIds = topProducts.map((p) => p.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  return {
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue: Number(revenueResult._sum.total || 0),
    recentOrders,
    topProducts: topProducts.map((tp) => ({
      ...tp,
      product: products.find((p) => p.id === tp.productId),
    })),
    pendingOrders,
  }
}

const orderStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  PROCESSING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  REFUNDED: 'danger',
}

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>
}) {
  const [data, sp] = await Promise.all([getDashboardData(), searchParams])
  const accessDenied = sp.denied === '1'

  return (
    <div className="space-y-6">
      {accessDenied && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          <ShieldOff size={16} className="shrink-0 text-red-500" />
          <span>You don&apos;t have permission to access that section.</span>
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your store performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(data.totalRevenue)}
          icon={DollarSign}
          color="brand"
          change="All time"
          changeType="neutral"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon={ShoppingCart}
          color="blue"
          change={`${data.pendingOrders} pending`}
          changeType={data.pendingOrders > 0 ? 'negative' : 'neutral'}
        />
        <StatCard
          title="Products"
          value={data.totalProducts}
          icon={Package}
          color="green"
          change="Active products"
          changeType="neutral"
        />
        <StatCard
          title="Customers"
          value={data.totalUsers}
          icon={Users}
          color="purple"
          change="Registered users"
          changeType="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <Link href="/admin/orders" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentOrders.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No orders yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.recentOrders.map((order) => (
                  <div key={order.id} className="px-6 py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{order.firstName} {order.lastName} · {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={orderStatusVariant[order.status] || 'default'}>
                        {order.status}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(order.total))}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <Link href="/admin/products" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.topProducts.length === 0 ? (
              <p className="px-6 py-8 text-sm text-center text-gray-500">No sales data yet</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.topProducts.map((item, i) => (
                  <div key={item.productId} className="px-6 py-3 flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product?.name || 'Unknown Product'}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">{item._sum.quantity} sold</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
