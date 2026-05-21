import type { User, Category, Product, Brand, Banner, Page, Setting, Order, OrderItem } from '@prisma/client'

export type { User, Category, Product, Brand, Banner, Page, Setting, Order, OrderItem }

export type UserRole = 'ADMIN' | 'MANAGER' | 'CUSTOMER'
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

export interface ProductWithRelations extends Product {
  category?: Category | null
  brand?: Brand | null
}

export interface SerializedProduct extends Omit<Product, 'price' | 'salePrice'> {
  price: number
  salePrice: number | null
  category?: Category | null
  brand?: Brand | null
}

export interface OrderWithRelations extends Order {
  user?: User | null
  orderItems: (OrderItem & { product: Product })[]
}

export interface CategoryWithChildren extends Category {
  children?: Category[]
  _count?: { products: number }
}

export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalProducts: number
  totalUsers: number
  recentOrders: OrderWithRelations[]
  topProducts: ProductWithRelations[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string        // role name, e.g. "ADMIN"
      roleId: string      // FK to roles.id
      permissions: string[]
    }
  }
}
