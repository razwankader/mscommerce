import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatPrice(amount: number | string, currency = '৳') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return `${currency}${num.toLocaleString('en-BD')}`
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MS-${timestamp}-${random}`
}

export function serializeProduct<T extends { price: any; salePrice: any; buyingPrice?: any; dealerPrice?: any }>(
  p: T
): Omit<T, 'price' | 'salePrice' | 'buyingPrice' | 'dealerPrice'> & { price: number; salePrice: number | null; buyingPrice: number | null; dealerPrice: number | null } {
  return {
    ...p,
    price: Number(p.price),
    salePrice: p.salePrice != null ? Number(p.salePrice) : null,
    buyingPrice: p.buyingPrice != null ? Number(p.buyingPrice) : null,
    dealerPrice: p.dealerPrice != null ? Number(p.dealerPrice) : null,
  }
}
