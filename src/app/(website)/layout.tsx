import { WebsiteHeader } from '@/components/website/header'
import { WebsiteFooter } from '@/components/website/footer'
import { CartProvider } from '@/context/cart-context'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from 'sonner'

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <NextTopLoader color="#f97316" height={3} showSpinner={false} />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: '!flex-col !items-start',
            title: '!text-xs !text-gray-400 !font-normal',
            description: '!text-sm !text-gray-900 !font-semibold !leading-snug',
            actionButton: '!mt-3 !w-full !justify-center !bg-brand !text-white hover:!bg-orange-600',
          },
        }}
      />
      <div className="min-h-screen flex flex-col">
        <WebsiteHeader />
        <main className="flex-1">{children}</main>
        <WebsiteFooter />
      </div>
    </CartProvider>
  )
}
