'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { Banner } from '@/lib/banners'
import { hostImagenPermitido } from '@/lib/imagen'

const INTERVALO_MS = 6000
const UMBRAL_SWIPE = 40

export default function CarruselBanners({ banners }: { banners: Banner[] }) {
    const [indice, setIndice] = useState(0)
    const [pausado, setPausado] = useState(false)
    const inicioX = useRef<number | null>(null)

    useEffect(() => {
        if (banners.length <= 1 || pausado) return
        const id = setInterval(() => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
            setIndice((actual) => (actual + 1) % banners.length)
        }, INTERVALO_MS)
        return () => clearInterval(id)
    }, [banners.length, pausado])

    if (banners.length === 0) return null

    const indiceActual = Math.min(indice, banners.length - 1)
    const varias = banners.length > 1

    function mover(delta: number) {
        setIndice((actual) => (actual + delta + banners.length) % banners.length)
    }

    function alTocarInicio(e: React.TouchEvent) {
        inicioX.current = e.touches[0].clientX
    }

    function alTocarFin(e: React.TouchEvent) {
        const inicio = inicioX.current
        inicioX.current = null
        if (inicio === null) return
        const delta = e.changedTouches[0].clientX - inicio
        if (Math.abs(delta) < UMBRAL_SWIPE) return
        mover(delta < 0 ? 1 : -1)
    }

    return (
        <section
            role="region"
            aria-roledescription="carrusel"
            aria-label="Promociones"
            className="relative w-full overflow-hidden"
        >
            <div
                className="relative aspect-[2/1] w-full min-h-[210px] bg-humo sm:aspect-[21/9] md:aspect-[21/8] md:min-h-[340px]"
                onMouseEnter={() => setPausado(true)}
                onMouseLeave={() => setPausado(false)}
                onFocus={() => setPausado(true)}
                onBlur={() => setPausado(false)}
                onTouchStart={alTocarInicio}
                onTouchEnd={alTocarFin}
            >
                {banners.map((banner, i) => {
                    const activo = i === indiceActual
                    return (
                        <div
                            key={banner.id}
                            role="group"
                            aria-roledescription="diapositiva"
                            aria-label={`${i + 1} de ${banners.length}`}
                            aria-hidden={!activo}
                            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                                activo ? 'opacity-100' : 'pointer-events-none opacity-0'
                            }`}
                        >
                            <Image
                                src={banner.imagen}
                                alt={banner.texto_alt}
                                fill
                                sizes="100vw"
                                priority={i === 0}
                                unoptimized={!hostImagenPermitido(banner.imagen)}
                                className="h-full w-full object-cover object-center"
                            />
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-humo/35 via-transparent to-humo/10" />
                        </div>
                    )
                })}

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-porcelana to-transparent" />

                {varias && (
                    <>
                        <button
                            type="button"
                            onClick={() => mover(-1)}
                            aria-label="Banner anterior"
                            className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-humo/30 text-porcelana backdrop-blur-md transition-colors hover:bg-humo/60 md:left-6 md:h-12 md:w-12"
                        >
                            <Chevron dir="izq" />
                        </button>

                        <button
                            type="button"
                            onClick={() => mover(1)}
                            aria-label="Banner siguiente"
                            className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-humo/30 text-porcelana backdrop-blur-md transition-colors hover:bg-humo/60 md:right-6 md:h-12 md:w-12"
                        >
                            <Chevron dir="der" />
                        </button>

                        <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
                            {banners.map((banner, i) => (
                                <button
                                    key={banner.id}
                                    type="button"
                                    onClick={() => setIndice(i)}
                                    aria-label={`Ir al banner ${i + 1}`}
                                    aria-current={i === indiceActual ? 'true' : undefined}
                                    className={`h-1.5 rounded-full shadow-sm transition-all ${
                                        i === indiceActual
                                            ? 'w-8 bg-porcelana'
                                            : 'w-2 bg-porcelana/55 hover:bg-porcelana/90'
                                    }`}
                                />
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setPausado((valor) => !valor)}
                            aria-label={pausado ? 'Reanudar carrusel' : 'Pausar carrusel'}
                            className="absolute bottom-3 right-3 z-10 rounded-full border border-white/25 bg-humo/30 p-2 text-porcelana backdrop-blur-md transition-colors hover:bg-humo/60"
                        >
                            {pausado ? <IconoPlay /> : <IconoPausa />}
                        </button>
                    </>
                )}
            </div>
        </section>
    )
}

function Chevron({ dir }: { dir: 'izq' | 'der' }) {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <polyline points={dir === 'izq' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'} />
        </svg>
    )
}

function IconoPlay() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
        </svg>
    )
}

function IconoPausa() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
        </svg>
    )
}
