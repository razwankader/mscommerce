# Matin Sanitary — E-Commerce Website

Full-stack e-commerce platform for Matin Sanitary, a sanitary ware retailer in Bangladesh. Built with Next.js 15, PostgreSQL, and Prisma ORM.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL 16 |
| ORM | Prisma |
| Auth | NextAuth v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context (cart) |
| Container | Docker + Docker Compose |

## Features

### Customer-Facing
- Product catalog with search, category & brand filters
- Sale filter (discounted products)
- Product detail pages with related products
- Shopping cart (localStorage-persisted)
- Checkout with Cash on Delivery
- Order confirmation with order number

### Admin Panel (`/admin`)
- Dashboard with sales stats and charts
- Product management (CRUD, images, pricing)
- Category & brand management
- Order management with status updates
- Banner carousel management
- User management
- Site settings (shipping cost, free shipping threshold)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerised setup)
- PostgreSQL 16 (if running without Docker)

## Local Development (Without Docker)

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://admin:password123@localhost:5432/matin_sanitary"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Start PostgreSQL
```bash
# Using Docker just for the DB
docker-compose up postgres -d
```

### 4. Push schema and seed
```bash
npm run db:push
npm run db:seed                          # creates admin user + settings
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-products.ts
```

### 5. Run dev server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Docker Deployment (Full Stack)

Runs app, PostgreSQL, and pgAdmin together.

### 1. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with production values (especially `NEXTAUTH_SECRET`).

### 2. Build and start
```bash
docker-compose up -d --build
```

### 3. Run migrations and seed (first time only)
```bash
docker exec matin_sanitary_app npx prisma db push
docker exec matin_sanitary_app npx tsx prisma/seed.ts
```

### Services
| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5432 |

### Useful commands
```bash
docker-compose down          # stop all services
docker-compose logs -f app   # stream app logs
docker-compose up -d         # start without rebuilding
docker-compose up -d --build # rebuild and start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Random secret ≥ 32 chars |
| `NEXTAUTH_URL` | Yes | Full URL of the app (e.g. `https://yourdomain.com`) |
| `POSTGRES_USER` | Docker | DB username (default: `admin`) |
| `POSTGRES_PASSWORD` | Docker | DB password |
| `POSTGRES_DB` | Docker | DB name (default: `matin_sanitary`) |

Generate a strong secret:
```bash
openssl rand -base64 32
```

## NPM Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # start production server
npm run lint         # ESLint
npm run db:push      # push schema to DB (no migration history)
npm run db:migrate   # create and run migration
npm run db:seed      # seed admin user and default settings
npm run db:studio    # open Prisma Studio (GUI)
npm run db:generate  # regenerate Prisma client
```

## Default Admin Account

After running `npm run db:seed`:

| Field | Value |
|-------|-------|
| Email | admin@matinsanitary.com |
| Password | admin123 |

**Change the password immediately after first login.**

## Project Structure

```
src/
├── app/
│   ├── (website)/          # Customer-facing pages
│   │   ├── page.tsx        # Home page
│   │   ├── products/       # Product listing & detail
│   │   ├── categories/     # Category pages
│   │   ├── cart/           # Shopping cart
│   │   ├── checkout/       # Checkout (COD)
│   │   └── order-success/  # Order confirmation
│   ├── admin/              # Admin panel
│   └── api/                # API routes
├── components/
│   ├── website/            # Customer-facing components
│   ├── admin/              # Admin components
│   └── ui/                 # Shared UI components
├── context/
│   └── cart-context.tsx    # Cart state (localStorage)
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── shipping.ts         # Shipping config helper
│   └── utils.ts            # Utilities
├── types/
│   └── index.ts            # Shared TypeScript types
prisma/
├── schema.prisma           # Database schema
├── seed.ts                 # Admin user + settings seed
└── seed-products.ts        # Product catalog seed
```

## Production Checklist

- [ ] Set a strong `NEXTAUTH_SECRET` (≥ 32 random chars)
- [ ] Set correct `NEXTAUTH_URL` to your domain
- [ ] Change default admin password
- [ ] Set up SSL/HTTPS (Nginx reverse proxy or Cloudflare)
- [ ] Configure `next.config.ts` image domains for your CDN/storage
- [ ] Set up regular PostgreSQL backups
