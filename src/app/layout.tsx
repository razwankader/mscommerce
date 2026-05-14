import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { SpeedInsights } from '@vercel/speed-insights/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Matin Sanitary - Premium Sanitary & Bathroom Solutions',
    template: '%s | Matin Sanitary',
  },
  description: 'Your trusted source for premium sanitary ware, bathroom fittings, kitchen sinks and accessories.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  )
}
