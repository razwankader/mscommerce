'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Banner {
  id: string
  title: string
  subtitle: string | null
  link: string | null
  image: string | null
}

interface Props {
  banners: Banner[]
}

const INTERVAL = 4000

export function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const count = banners.length

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + count) % count)
  }, [count])

  const next = useCallback(() => goTo(current + 1), [current, goTo])
  const prev = useCallback(() => goTo(current - 1), [current, goTo])

  // auto-play
  useEffect(() => {
    if (paused || count <= 1) return
    timerRef.current = setInterval(next, INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [next, paused, count])

  // touch/swipe
  const touchStartX = useRef(0)
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
  }

  const bgGradients = [
    'from-gray-900 via-gray-800 to-gray-900',
    'from-slate-900 via-slate-800 to-gray-900',
    'from-zinc-900 via-stone-800 to-zinc-900',
    'from-neutral-900 via-gray-800 to-neutral-900',
  ]

  if (!count) return null

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slides track */}
      <div
        ref={trackRef}
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={cn(
              'relative min-w-full bg-gradient-to-br text-white overflow-hidden',
              bgGradients[i % bgGradients.length]
            )}
          >
            {/* Full background image when provided */}
            {banner.image && (
              <>
                <Image
                  src={banner.image}
                  alt={banner.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
                {/* dark scrim so text stays readable */}
                <div className="absolute inset-0 bg-black/55" />
              </>
            )}
            {!banner.image && <div className="absolute inset-0 bg-brand/10" />}

            <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 max-w-2xl">
                <span className="inline-block bg-brand/20 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                  Premium Quality
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                  {banner.title}
                </h1>
                {banner.subtitle && (
                  <p className="mt-4 text-lg text-gray-300 leading-relaxed">
                    {banner.subtitle}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={banner.link || '/products'}
                    className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Shop Now <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 border border-white/30 hover:border-white text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>

              {/* Stats — only on first slide without image to avoid clutter */}
              {i === 0 && !banner.image && (
                <div className="hidden md:flex flex-col gap-4 text-center">
                  {[
                    { value: '20+', label: 'Years Experience' },
                    { value: '500+', label: 'Products' },
                    { value: '10K+', label: 'Happy Customers' },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-6">
                      <p className="text-4xl font-bold text-orange-300">{s.value}</p>
                      <p className="text-sm text-gray-300 mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
            aria-label="Next"
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={cn(
                'rounded-full transition-all duration-300',
                i === current
                  ? 'bg-brand w-6 h-2.5'
                  : 'bg-white/50 hover:bg-white/80 w-2.5 h-2.5'
              )}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
