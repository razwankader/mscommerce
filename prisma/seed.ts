import { PrismaClient, ProductStatus, BannerStatus, PageStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@matinsanitary.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@matinsanitary.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('Admin created:', admin.email)

  // Categories
  const bathroomCat = await prisma.category.upsert({
    where: { slug: 'bathroom' },
    update: {},
    create: {
      name: 'Bathroom',
      slug: 'bathroom',
      description: 'Complete bathroom solutions',
      order: 1,
    },
  })

  const kitchenCat = await prisma.category.upsert({
    where: { slug: 'kitchen' },
    update: {},
    create: {
      name: 'Kitchen',
      slug: 'kitchen',
      description: 'Kitchen fittings and fixtures',
      order: 2,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'bathroom-fittings' },
    update: {},
    create: {
      name: 'Bathroom Fittings',
      slug: 'bathroom-fittings',
      description: 'Taps, mixers, and fittings',
      parentId: bathroomCat.id,
      order: 1,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'sanitary-ware' },
    update: {},
    create: {
      name: 'Sanitary Ware',
      slug: 'sanitary-ware',
      description: 'Toilets, basins, and more',
      parentId: bathroomCat.id,
      order: 2,
    },
  })

  await prisma.category.upsert({
    where: { slug: 'kitchen-sinks' },
    update: {},
    create: {
      name: 'Kitchen Sinks',
      slug: 'kitchen-sinks',
      description: 'Stainless steel and ceramic sinks',
      parentId: kitchenCat.id,
      order: 1,
    },
  })

  // Brands
  const brand1 = await prisma.brand.upsert({
    where: { slug: 'grohe' },
    update: {},
    create: { name: 'Grohe', slug: 'grohe' },
  })

  const brand2 = await prisma.brand.upsert({
    where: { slug: 'american-standard' },
    update: {},
    create: { name: 'American Standard', slug: 'american-standard' },
  })

  await prisma.brand.upsert({
    where: { slug: 'kohler' },
    update: {},
    create: { name: 'Kohler', slug: 'kohler' },
  })

  // Products
  const products = [
    {
      name: 'Premium Single Lever Basin Mixer',
      slug: 'premium-single-lever-basin-mixer',
      description: 'High-quality chrome-plated basin mixer with single lever operation.',
      shortDesc: 'Chrome-plated single lever basin mixer',
      sku: 'TMP-001',
      price: 8500,
      salePrice: 7200,
      stock: 25,
      categoryId: bathroomCat.id,
      brandId: brand1.id,
      featured: true,
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Wall Mounted Toilet Suite',
      slug: 'wall-mounted-toilet-suite',
      description: 'Modern wall-hung toilet with concealed cistern. Easy to clean.',
      shortDesc: 'Modern wall-hung toilet',
      sku: 'TLT-002',
      price: 45000,
      stock: 10,
      categoryId: bathroomCat.id,
      brandId: brand2.id,
      featured: true,
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Stainless Steel Kitchen Sink',
      slug: 'stainless-steel-kitchen-sink',
      description: 'Double bowl stainless steel sink, 304 grade. Includes waste fittings.',
      shortDesc: '304-grade double bowl sink',
      sku: 'SNK-003',
      price: 12000,
      salePrice: 10500,
      stock: 30,
      categoryId: kitchenCat.id,
      featured: true,
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Rainfall Shower Head',
      slug: 'rainfall-shower-head',
      description: '300mm square rainfall shower head with anti-limescale nozzles.',
      shortDesc: '300mm square rainfall shower',
      sku: 'SHW-004',
      price: 5500,
      stock: 50,
      categoryId: bathroomCat.id,
      brandId: brand1.id,
      featured: false,
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Pedestal Wash Basin',
      slug: 'pedestal-wash-basin',
      description: 'Classic white ceramic pedestal basin. 550mm width.',
      shortDesc: 'Classic ceramic pedestal basin',
      sku: 'BSN-005',
      price: 8000,
      stock: 20,
      categoryId: bathroomCat.id,
      brandId: brand2.id,
      featured: false,
      status: ProductStatus.ACTIVE,
    },
    {
      name: 'Bath Tub Freestanding',
      slug: 'bath-tub-freestanding',
      description: 'Luxury freestanding acrylic bath tub. 1500mm length.',
      shortDesc: 'Luxury freestanding acrylic tub',
      sku: 'BTH-006',
      price: 85000,
      salePrice: 75000,
      stock: 5,
      categoryId: bathroomCat.id,
      featured: true,
      status: ProductStatus.ACTIVE,
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: p as any,
    })
  }

  // Banners
  await prisma.banner.upsert({
    where: { id: 'banner-1' },
    update: {},
    create: {
      id: 'banner-1',
      title: 'Premium Sanitary Solutions',
      subtitle: 'Transform your bathroom with our exclusive collection',
      image: '/images/banner-1.jpg',
      link: '/products',
      order: 1,
      status: BannerStatus.ACTIVE,
    },
  })

  await prisma.banner.upsert({
    where: { id: 'banner-2' },
    update: {},
    create: {
      id: 'banner-2',
      title: 'Kitchen Essentials',
      subtitle: 'Quality kitchen fittings at best prices',
      image: '/images/banner-2.jpg',
      link: '/products?category=kitchen',
      order: 2,
      status: BannerStatus.ACTIVE,
    },
  })

  // Pages
  await prisma.page.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      title: 'About Us',
      slug: 'about-us',
      content: `<h2>About Matin Sanitary</h2>
<p>Matin Sanitary is a leading sanitary ware and bathroom fittings supplier with over 20 years of experience in the industry.</p>
<p>We offer premium quality products from the world's top brands including Grohe, American Standard, Kohler, and many more.</p>
<h3>Our Mission</h3>
<p>To provide our customers with the finest sanitary solutions at competitive prices, backed by exceptional customer service.</p>
<h3>Why Choose Us?</h3>
<ul>
<li>Genuine products with manufacturer warranty</li>
<li>Expert installation services</li>
<li>Wide range of brands and styles</li>
<li>Competitive pricing</li>
<li>After-sales support</li>
</ul>`,
      status: PageStatus.PUBLISHED,
    },
  })

  await prisma.page.upsert({
    where: { slug: 'contact' },
    update: {},
    create: {
      title: 'Contact Us',
      slug: 'contact',
      content: `<h2>Contact Us</h2>
<p>We'd love to hear from you. Get in touch with our team.</p>
<p><strong>Address:</strong> 78/5, D.I.T Road, Malibagh, Dhaka-1217</p>
<p><strong>Phone:</strong> 01719-188784</p>
<p><strong>Email:</strong> info@matinsanitary.com</p>
<p><strong>Hours:</strong> Mon-Sat: 9am - 7pm</p>`,
      status: PageStatus.PUBLISHED,
    },
  })

  // Settings
  const settings = [
    { key: 'site_name', value: 'Matin Sanitary', group: 'general' },
    { key: 'site_tagline', value: 'Premium Sanitary & Bathroom Solutions', group: 'general' },
    { key: 'site_email', value: 'info@matinsanitary.com', group: 'general' },
    { key: 'site_phone', value: '01719-188784', group: 'general' },
    { key: 'site_address', value: '78/5, D.I.T Road, Malibagh, Dhaka-1217', group: 'general' },
    { key: 'currency', value: 'BDT', group: 'general' },
    { key: 'currency_symbol', value: '৳', group: 'general' },
    { key: 'shipping_cost', value: '200', group: 'shipping' },
    { key: 'free_shipping_threshold', value: '5000', group: 'shipping' },
    { key: 'facebook_url', value: 'https://facebook.com', group: 'social' },
    { key: 'instagram_url', value: 'https://instagram.com', group: 'social' },
    { key: 'whatsapp_number', value: '+923001234567', group: 'social' },
  ]

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
