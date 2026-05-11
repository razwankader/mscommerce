import { WebsiteHeader } from '@/components/website/header'
import { WebsiteFooter } from '@/components/website/footer'
import { CartProvider } from '@/context/cart-context'
import NextTopLoader from 'nextjs-toploader'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <NextTopLoader color="#f97316" height={3} showSpinner={false} />
      <div className="min-h-screen flex flex-col">
        <WebsiteHeader />
        <main className="flex-1">{children}</main>
        <WebsiteFooter />
      </div>
    </CartProvider>
  )
}
