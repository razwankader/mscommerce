import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { slugify } from '@/lib/utils'
import { revalidateTag } from 'next/cache'
import Papa from 'papaparse'

interface CsvRow {
  name: string
  sku: string
  barcode: string
  price: string
  salePrice: string
  stock: string
  status: string
  featured: string
  bundle: string
  categorySlug: string
  brandSlug: string
  shortDesc: string
  description: string
  images: string
  metaTitle: string
  metaDesc: string
  relatedSkus: string
  accessorySkus: string
  fittingSkus: string
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })

  const text = await file.text()

  const { data: rows, errors: parseErrors } = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  })

  if (parseErrors.length && !rows.length) {
    return NextResponse.json({ error: 'CSV parse failed', details: parseErrors }, { status: 400 })
  }

  // Pre-load category and brand slug → id maps
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ select: { id: true, slug: true } }),
    prisma.brand.findMany({ select: { id: true, slug: true } }),
  ])
  const catMap = new Map(categories.map((c) => [c.slug, c.id]))
  const brandMap = new Map(brands.map((b) => [b.slug, b.id]))

  const results = { created: 0, updated: 0, failed: 0, errors: [] as string[] }

  // Track sku→id for relation resolution (covers products created in this batch)
  const skuToId = new Map<string, string>()

  // --- Pass 1: upsert products ---
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowLabel = `Row ${i + 2} (${row.sku || 'no SKU'})`

    if (!row.name || !row.sku || !row.price) {
      results.failed++
      results.errors.push(`${rowLabel}: name, sku, and price are required`)
      continue
    }

    const price = parseFloat(row.price)
    const salePrice = row.salePrice ? parseFloat(row.salePrice) : null
    const stock = parseInt(row.stock || '0', 10)
    const status = ['ACTIVE', 'INACTIVE', 'DRAFT'].includes(row.status?.toUpperCase())
      ? (row.status.toUpperCase() as 'ACTIVE' | 'INACTIVE' | 'DRAFT')
      : 'ACTIVE'
    const featured = row.featured?.toLowerCase() === 'true'
    const images = row.images ? row.images.split('|').map((u) => u.trim()).filter(Boolean) : []
    const categoryId = row.categorySlug ? (catMap.get(row.categorySlug) ?? null) : null
    const brandId = row.brandSlug ? (brandMap.get(row.brandSlug) ?? null) : null

    if (isNaN(price)) {
      results.failed++
      results.errors.push(`${rowLabel}: invalid price "${row.price}"`)
      continue
    }

    try {
      const existing = await prisma.product.findUnique({ where: { sku: row.sku }, select: { id: true } })

      const barcode = row.barcode || null
      const bundle = row.bundle?.toLowerCase() === 'true'

      if (existing) {
        await prisma.product.update({
          where: { sku: row.sku },
          data: { name: row.name, price, salePrice, stock, status, featured, bundle, images, categoryId, brandId,
            barcode, shortDesc: row.shortDesc || null, description: row.description || null,
            metaTitle: row.metaTitle || null, metaDesc: row.metaDesc || null },
        })
        skuToId.set(row.sku, existing.id)
        results.updated++
      } else {
        const slug = slugify(row.name) + '-' + Date.now() + '-' + i
        const created = await prisma.product.create({
          data: { name: row.name, slug, sku: row.sku, price, salePrice, stock, status, featured, bundle, images,
            categoryId, brandId, barcode, shortDesc: row.shortDesc || null, description: row.description || null,
            metaTitle: row.metaTitle || null, metaDesc: row.metaDesc || null },
        })
        skuToId.set(row.sku, created.id)
        results.created++
      }
    } catch (err: any) {
      results.failed++
      results.errors.push(`${rowLabel}: ${err.message}`)
    }
  }

  // Also load existing SKUs for relation resolution
  const allReferencedSkus = new Set<string>()
  for (const row of rows) {
    for (const col of ['relatedSkus', 'accessorySkus', 'fittingSkus'] as const) {
      if (row[col]) row[col].split('|').forEach((s) => allReferencedSkus.add(s.trim()))
    }
  }
  if (allReferencedSkus.size > 0) {
    const existing = await prisma.product.findMany({
      where: { sku: { in: Array.from(allReferencedSkus) } },
      select: { id: true, sku: true },
    })
    existing.forEach((p) => { if (p.sku) skuToId.set(p.sku, p.id) })
  }

  // --- Pass 2: upsert relations ---
  for (const row of rows) {
    const productId = skuToId.get(row.sku)
    if (!productId) continue

    const relationGroups: { col: 'relatedSkus' | 'accessorySkus' | 'fittingSkus'; type: 'RELATED' | 'ACCESSORY' | 'FITTING' }[] = [
      { col: 'relatedSkus', type: 'RELATED' },
      { col: 'accessorySkus', type: 'ACCESSORY' },
      { col: 'fittingSkus', type: 'FITTING' },
    ]

    for (const { col, type } of relationGroups) {
      if (!row[col]) continue
      const skus = row[col].split('|').map((s) => s.trim()).filter(Boolean)
      for (const sku of skus) {
        const relatedId = skuToId.get(sku)
        if (!relatedId || relatedId === productId) continue
        try {
          await prisma.productRelation.upsert({
            where: { productId_relatedId: { productId, relatedId } },
            update: { type },
            create: { productId, relatedId, type },
          })
        } catch {
          // non-fatal — skip duplicate/constraint errors
        }
      }
    }
  }

  revalidateTag('products')
  return NextResponse.json({ ...results, total: rows.length })
}
