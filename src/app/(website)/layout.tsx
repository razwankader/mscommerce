import { WebsiteHeader } from '@/components/website/header'
import { WebsiteFooter } from '@/components/website/footer'
import { CartProvider } from '@/context/cart-context'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <WebsiteHeader />
        <main className="flex-1">{children}</main>
        <WebsiteFooter />
      </div>
    </CartProvider>
  )
}
