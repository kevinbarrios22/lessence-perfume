'use client'

import { usePathname } from 'next/navigation'
import { INSTAGRAM_URL } from '@/lib/config'

export default function Footer() {
    const pathname = usePathname()

    if (pathname.startsWith('/admin')) return null

    return (
        <footer className="mt-12 border-t border-alabastro bg-[#eee8de]">
            <div className="container-boutique flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between md:py-10">
                <div>
                    <p className="font-serif text-lg tracking-tight text-humo">L&apos;ESSENCE</p>
                    <p className="mt-1 text-sm text-nude">
                        Fragancias elegidas para dejar huella.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-5 sm:justify-start sm:gap-8">
                    <div>
                        <h2 className="text-[11px] uppercase tracking-[0.18em] text-cobre">
                            Síguenos
                        </h2>
                        <p className="mt-1 text-sm text-nude">
                            Novedades y recomendaciones
                        </p>
                    </div>

                    <a
                        href={INSTAGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Visitar Instagram de L’ESSENCE"
                        className="inline-flex min-h-11 items-center gap-2 rounded-full border border-alabastro bg-porcelana px-4 text-sm text-humo transition-colors hover:border-cobre"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="5" />
                            <circle cx="12" cy="12" r="4" />
                            <circle cx="17.5" cy="6.5" r=".75" fill="currentColor" stroke="none" />
                        </svg>
                        Instagram
                    </a>
                </div>
            </div>
            <div className="container-boutique border-t border-alabastro/70 py-4 text-xs text-nude">
                © {new Date().getFullYear()} L&apos;ESSENCE
            </div>
        </footer>
    )
}
