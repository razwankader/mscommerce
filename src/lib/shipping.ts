import { prisma } from '@/lib/prisma'

export interface ShippingConfig {
  threshold: number | null  // null = no free shipping
  cost: number              // default delivery fee
}

export async function getShippingConfig(): Promise<ShippingConfig> {
  const settings = await prisma.setting.findMany({
    where: { key: { in: ['free_shipping_threshold', 'shipping_cost'] } },
  })
  const map: Record<string, string> = {}
  for (const s of settings) map[s.key] = s.value

  const rawThreshold = map['free_shipping_threshold']
  const rawCost = map['shipping_cost']

  const threshold = rawThreshold && rawThreshold.trim() !== '' ? Number(rawThreshold) : null
  const cost = rawCost && rawCost.trim() !== '' ? Number(rawCost) : 150

  return { threshold, cost }
}

export function calcShipping(subtotal: number, config: ShippingConfig): number {
  if (config.threshold !== null && subtotal >= config.threshold) return 0
  return config.cost
}
