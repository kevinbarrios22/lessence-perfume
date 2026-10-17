'use client'

import { useCarrito } from '@/lib/CarritoContext'
import { formatearPrecio } from '@/lib/formato'
import { WHATSAPP_NUMERO } from '@/lib/config'
import ProductImage from '@/components/ProductImage'
import Link from 'next/link'

export default function CarritoPage() {
    const { items, quitarItem, cambiarCantidad, total } = useCarrito()

    if (items.length === 0) {
        return (
            <main className="container-boutique py-16 text-center">
                <h1 className="font-serif text-3xl tracking-tight text-humo mb-4">
                    Tu carrito está vacío
                </h1>
                <Link href="/" className="underline text-sm text-nude hover:text-cobre">
                    Seguir explorando
                </Link>
            </main>
        )
    }

    function generarMensajeWhatsApp() {
        const lineas = items.map(
            (i) => `• ${i.nombre} (${i.tamaño}) x${i.cantidad} - ${formatearPrecio(i.precio * i.cantidad)}`
        )
        const mensaje = [
            'Hola! Quiero consultar disponibilidad de:',
            '',
            ...lineas,
            '',
            `Total: ${formatearPrecio(total)}`,
        ].join('\n')
        return `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`
    }

    return (
        <main className="container-boutique py-10 md:py-14">
            <div className="flex items-center justify-between mb-8">
                <Link href="/#catalogo" className="text-sm text-nude hover:text-cobre">
                    ← Seguir explorando
                </Link>
                <h1 className="font-serif text-2xl tracking-tight text-humo">Tu carrito</h1>
                <div className="w-24" />
            </div>

            <div className="divide-y divide-alabastro">
                {items.map((item) => (
                    <div key={item.varianteId} className="flex gap-3 sm:gap-4 py-5">
                        <ProductImage
                            src={item.imagen || null}
                            alt={item.nombre}
                            sizes="80px"
                            className="w-20 h-24 rounded-sm shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-cobre text-[10px] tracking-[0.15em] uppercase">
                                        {item.marca}
                                    </p>
                                    <p className="font-serif text-base sm:text-lg tracking-tight text-humo leading-snug">
                                        {item.nombre}
                                    </p>
                                    <p className="text-sm text-nude">{item.tamaño}</p>
                                </div>
                                <p className="font-serif text-base sm:text-lg text-humo shrink-0">
                                    {formatearPrecio(item.precio * item.cantidad)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() => cambiarCantidad(item.varianteId, item.cantidad - 1)}
                                    className="w-9 h-9 md:w-8 md:h-8 border rounded-sm text-base leading-none text-humo border-alabastro flex items-center justify-center"
                                    aria-label="Disminuir cantidad"
                                >
                                    −
                                </button>
                                <span className="text-sm w-6 text-center text-humo tabular-nums">
                                    {item.cantidad}
                                </span>
                                <button
                                    onClick={() => cambiarCantidad(item.varianteId, item.cantidad + 1)}
                                    className="w-9 h-9 md:w-8 md:h-8 border rounded-sm text-base leading-none text-humo border-alabastro flex items-center justify-center"
                                    aria-label="Aumentar cantidad"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => quitarItem(item.varianteId)}
                                    className="text-xs ml-1 underline text-nude hover:text-cobre"
                                >
                                    Quitar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-alabastro">
                <span className="text-cobre text-[11px] tracking-[0.2em] uppercase">Total</span>
                <span className="font-serif text-3xl text-humo">{formatearPrecio(total)}</span>
            </div>

            <a
                href={generarMensajeWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 block w-full md:w-auto md:mx-auto md:min-w-[26rem] text-center py-4 md:py-5 px-10 rounded-md font-medium text-base md:text-lg tracking-wide transition hover:opacity-90"
                style={{ background: 'var(--humo)', color: 'var(--porcelana)' }}
            >
                Confirmar pedido por WhatsApp
            </a>

            <p className="text-xs text-center mt-3 text-nude">
                Te contactaremos para confirmar disponibilidad y coordinar envío.
            </p>
        </main>
    )
}