'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCarrito } from '@/lib/CarritoContext'

export default function Header() {
    const { cantidadTotal } = useCarrito()
    const pathname = usePathname()

    if (pathname.startsWith('/admin')) {
        return null
    }

    return (
        <header
            className="sticky top-0 z-50 bg-porcelana/80 backdrop-blur-md border-b border-alabastro"
            style={{ paddingTop: 'var(--sat)' }}
        >
            <div className="container-boutique flex items-center justify-between h-16">
                <Link href="/" aria-label="L'ESSENCE — inicio" className="flex items-center gap-2.5">
                    <Image
                        src="/logo.png"
                        alt=""
                        width={40}
                        height={40}
                        priority
                        className="h-9 w-9 object-contain"
                    />
                    <span className="font-serif text-lg tracking-tight text-humo">
                        L&apos;ESSENCE
                    </span>
                </Link>

                <Link
                    href="/carrito"
                    aria-label={`Carrito con ${cantidadTotal} items`}
                    className="relative flex items-center justify-center w-11 h-11 -mr-2 text-humo"
                >
                    <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                    </svg>
                    {cantidadTotal > 0 && (
                        <span className="absolute top-1 right-0 min-w-[18px] h-[18px] px-1 bg-humo text-porcelana text-[10px] font-sans font-medium flex items-center justify-center rounded-full leading-none">
                            {cantidadTotal}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    )
}
