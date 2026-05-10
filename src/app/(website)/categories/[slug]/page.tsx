import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/website/product-card'
import { serializeProduct } from '@/lib/utils'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await prisma.category.findUnique({ where: { slug: params.slug } })
  if (!cat) return { title: 'Category Not Found' }
  return { title: cat.name, description: cat.description || undefined }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { children: true },
  })

  if (!category) notFound()

  const page = parseInt(searchParams.page || '1')
  const limit = 12
  const skip = (page - 1) * limit

  const categoryIds = [category.id, ...category.children.map((c) => c.id)]

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: { categoryId: { in: categoryIds }, status: 'ACTIVE' },
      include: { category: true, brand: true },
      skip,
      take: limit,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    }).then(r => r.map(serializeProduct)),
    prisma.product.count({ where: { categoryId: { in: categoryIds }, status: 'ACTIVE' } }),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
        )}
        {category.children.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {category.children.map((sub) => (
              <a
                key={sub.id}
                href={`/categories/${sub.slug}`}
                className="text-sm px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-brand hover:text-brand transition-colors"
              >
                {sub.name}
              </a>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} products</p>

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No products in this category yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`?page=${p}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm border transition-colors ${
                p === page ? 'bg-brand text-white border-brand' : 'border-gray-200 text-gray-700 hover:border-brand'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
