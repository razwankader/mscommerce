import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: { width: 90, height: 30 },
  md: { width: 120, height: 40 },
  lg: { width: 160, height: 54 },
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const { width, height } = sizes[size]
  return (
    <Image
      src="/images/logo.png"
      alt="Matin Sanitary"
      width={width}
      height={height}
      className={cn('object-contain', className)}
      priority
    />
  )
}

export function LogoWhite({ className, size = 'md' }: LogoProps) {
  const { width, height } = sizes[size]
  return (
    <Image
      src="/images/logo.png"
      alt="Matin Sanitary"
      width={width}
      height={height}
      className={cn('object-contain brightness-0 invert', className)}
      priority
    />
  )
}
