'use client'

import { useEffect } from 'react'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <main className="container-boutique py-16 text-center">
            <p className="text-cobre text-[11px] tracking-[0.2em] uppercase">L&apos;ESSENCE</p>
            <h1 className="font-serif text-2xl tracking-tight text-humo mt-3">
                Algo salió mal
            </h1>
            <p className="text-sm text-nude mt-2">
                Ocurrió un error inesperado al cargar esta página.
            </p>
            <button
                onClick={reset}
                className="mt-6 px-6 py-3 rounded-sm text-sm text-porcelana"
                style={{ background: 'var(--humo)' }}
            >
                Volver a intentar
            </button>
        </main>
    )
}