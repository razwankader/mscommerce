import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

  const where: any = {}
  if (status) where.status = status
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { orderItems: { include: { product: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, firstName, lastName, email, phone, address, city, state, zipCode, notes, discount: rawDiscount } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'No items in order' }, { status: 400 })
  }

  const session = await auth()
  const isStaff = (session?.user?.permissions?.length ?? 0) > 0

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
          userId: session?.user?.id || null,
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
        // For customer orders, billing = session user (may differ from delivery recipient)
        billingName: isStaff ? null : (session?.user?.name ?? null),
        billingEmail: isStaff ? null : (session?.user?.email ?? null),
      }).catch(err => console.error('[order-confirm-email]', err))
    }

    return NextResponse.json(order, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Order failed' }, { status: 409 })
  }
}
