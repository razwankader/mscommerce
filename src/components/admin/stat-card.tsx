import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  color?: 'brand' | 'blue' | 'green' | 'purple'
}

export function StatCard({ title, value, icon: Icon, change, changeType = 'neutral', color = 'brand' }: StatCardProps) {
  const colors = {
    brand: 'bg-orange-50 text-brand',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={cn('mt-1 text-xs', changeColors[changeType])}>
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-xl p-3', colors[color])}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  )
}
