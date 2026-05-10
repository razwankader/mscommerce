import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About Us' }

export default async function AboutPage() {
  const page = await prisma.page.findUnique({ where: { slug: 'about-us', status: 'PUBLISHED' } })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">About Us</h1>
      <div className="w-16 h-1 bg-brand rounded-full mb-8" />
      {page ? (
        <div
          className="prose prose-gray max-w-none text-gray-600 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <p className="text-gray-600">About page content coming soon.</p>
      )}
    </div>
  )
}
