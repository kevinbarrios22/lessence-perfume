import Link from 'next/link'
import { SITIO_NOMBRE } from '@/lib/config'

export default function NotFound() {
    return (
        <main className="container-boutique py-16 text-center">
            <p className="text-cobre text-[11px] tracking-[0.2em] uppercase">{SITIO_NOMBRE}</p>
            <h1 className="font-serif text-3xl tracking-tight text-humo mt-3">
                Página no encontrada
            </h1>
            <p className="text-sm text-nude mt-2">
                No encontramos lo que buscabas. Puede que el enlace haya cambiado o ya no exista.
            </p>
            <Link
                href="/#catalogo"
                className="mt-6 inline-flex px-6 py-3 rounded-sm text-sm transition hover:opacity-90"
                style={{ background: 'var(--humo)', color: 'var(--porcelana)' }}
            >
                Volver al catálogo
            </Link>
        </main>
    )
}
