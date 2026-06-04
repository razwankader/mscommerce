import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { getShippingConfig, calcShipping } from '@/lib/shipping'
import { revalidateTag } from 'next/cache'
import { sendOrderConfirmationEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const paymentStatus = searchParams.get('paymentStatus') || '' // 'paid' | 'due'

  const where: any = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (paymentStatus) {
    // Use SQL subquery to find order IDs where SUM(payments.amount) >= total (paid) or < total (due)
    const rows = await prisma.$queryRaw<{ id: string }[]>(
      paymentStatus === 'paid'
        ? Prisma.sql`SELECT id FROM orders WHERE COALESCE((SELECT SUM(amount::numeric) FROM order_payments WHERE "orderId" = orders.id), 0) >= total::numeric`
        : Prisma.sql`SELECT id FROM orders WHERE COALESCE((SELECT SUM(amount::numeric) FROM order_payments WHERE "orderId" = orders.id), 0) < total::numeric`
    )
    where.id = { in: rows.map(r => r.id) }
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { orderItems: { include: { product: true } }, payments: { orderBy: { paidAt: 'asc' } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  const enriched = data.map((o: any) => {
    const paid = (o.payments || []).reduce((sum: number, p: any) => sum + (p.amount ? Number(p.amount) : 0), 0)
    return { ...o, isPaid: paid >= Number(o.total) }
  })

  return NextResponse.json({ data: enriched, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    items, firstName, lastName, email, phone, address, city, state, zipCode, notes,
    discount: rawDiscount, payments: rawPayments,
    offlineCustomerId,  // staff: existing offline customer id (pre-looked-up)
    createOfflineCustomer, // staff: { name, phone, email?, address?, city? } — new offline customer
  } = body
  // rawPayments: Array<{ method, amount?, referenceId?, bankName?, paidAt? }> — staff only

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items in order' }, { status: 400 })
  }

  const session = await auth()
  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

  // Resolve offline customer for staff orders
  let resolvedCustomerId: string | null = null
  if (isStaff) {
    if (offlineCustomerId) {
      // Existing offline customer — use as-is
      resolvedCustomerId = offlineCustomerId
    } else if (createOfflineCustomer?.phone) {
      // New offline customer — create profile
      const offlineRole = await prisma.role.findUnique({ where: { name: 'OFFLINE_CUSTOMER' } })
      if (offlineRole) {
        const parts = (createOfflineCustomer.name || '').trim().split(' ')
        const newCustomer = await prisma.user.create({
          data: {
            name: createOfflineCustomer.name || `${firstName} ${lastName}`.trim(),
            email: createOfflineCustomer.email || null,
            phone: createOfflineCustomer.phone,
            address: createOfflineCustomer.address || null,
            city: createOfflineCustomer.city || null,
            roleId: offlineRole.id,
            isActive: true,
          },
        })
        resolvedCustomerId = newCustomer.id
      }
    }
  } else {
    // Online customer — use session user
    resolvedCustomerId = session?.user?.id || null
  }

  const productIds = items.map((i: any) => i.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })

  // Early stock check (non-binding — real enforcement is inside the transaction)
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product) return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 })
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Insufficient stock for "${product.name}"` }, { status: 409 })
    }
  }

  let subtotal = 0
  const orderItems = items.map((item: any) => {
    const product = products.find((p) => p.id === item.productId)!
    const basePrice = Number(product.salePrice ?? product.price)
    // Allow staff to override price downward; ignore if not staff or price exceeds original
    const customPrice = isStaff && item.customPrice != null && item.customPrice > 0 && item.customPrice <= basePrice
      ? Number(item.customPrice)
      : basePrice
    subtotal += customPrice * item.quantity
    return { productId: item.productId, quantity: item.quantity, price: customPrice }
  })

  // Discount: staff only, must not exceed subtotal
  const discount = isStaff && rawDiscount > 0
    ? Math.min(Number(rawDiscount), subtotal)
    : 0

  const discountedSubtotal = subtotal - discount
  const shippingConfig = await getShippingConfig()
  const shipping = calcShipping(discountedSubtotal, shippingConfig)
  const total = discountedSubtotal + shipping

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Atomic stock decrement — WHERE stock >= quantity prevents overselling under concurrency
      const stockSnapshots: Record<string, number> = {}
      for (const item of items) {
        const before = await tx.product.findUnique({ where: { id: item.productId }, select: { stock: true } })
        if (!before || before.stock < item.quantity) {
          const product = products.find((p) => p.id === item.productId)
          throw new Error(`Insufficient stock for "${product?.name ?? item.productId}"`)
        }
        const updated = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
          select: { stock: true },
        })
        stockSnapshots[item.productId] = updated.stock
      }

      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: resolvedCustomerId,
          placedById: isStaff ? (session?.user?.id || null) : null,
          subtotal,
          discount,
          shipping,
          tax: 0,
          total,
          firstName,
          lastName,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          notes,
          placedByStaff: isStaff,
          orderItems: { create: orderItems },
        },
        include: { orderItems: { include: { product: true } } },
      })

      // Create payment records (staff only)
      if (isStaff && Array.isArray(rawPayments) && rawPayments.length > 0) {
        const VALID_METHODS = ['COD', 'BKASH', 'NAGAD', 'ROCKET', 'BANK']
        await tx.orderPayment.createMany({
          data: rawPayments
            .filter((p: any) => VALID_METHODS.includes(p.method))
            .map((p: any) => ({
              orderId: order.id,
              method: p.method,
              amount: p.amount ? Number(p.amount) : null,
              referenceId: p.referenceId || null,
              bankName: p.method === 'BANK' ? (p.bankName || null) : null,
              paidAt: p.paidAt ? new Date(p.paidAt) : new Date(),
            })),
        })
      } else if (!isStaff) {
        // Customer orders default to COD
        await tx.orderPayment.create({
          data: { orderId: order.id, method: 'COD', paidAt: new Date() },
        })
      }

      // Log SALE stock transactions
      await tx.stockTransaction.createMany({
        data: items.map((item: any) => ({
          productId: item.productId,
          type: 'SALE' as const,
          quantity: -item.quantity,
          balanceAfter: stockSnapshots[item.productId],
          orderId: order.id,
          note: `Order ${order.orderNumber}`,
        })),
      })

      return order
    })

    revalidateTag('products')

    if (email) {
      sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        firstName,
        email,
        items: order.orderItems.map((oi: any) => ({
          productName: oi.product.name,
          quantity: oi.quantity,
          price: Number(oi.price),
        })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        shipping: Number(order.shipping),
        total: Number(order.total),
        address,
        city,
        placedByStaff: isStaff,
        billingName: isStaff ? null : (session?.user?.name ?? null),
        billingEmail: isStaff ? null : (session?.user?.email ?? null),
      }).catch(err => console.error('[order-confirm-email]', err))
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Order failed' }, { status: 409 })
  }
}
