'use client'

import { useEffect, useState } from 'react'
import { useCarrito } from '@/lib/CarritoContext'
import { formatearPrecio } from '@/lib/formato'
import { WHATSAPP_NUMERO } from '@/lib/config'
import ProductImage from '@/components/ProductImage'
import Link from 'next/link'

type ItemValidado = {
    varianteId: string
    productoId: string
    slug: string
    nombre: string
    marca: string
    imagen: string | null
    tamaño: string
    precio: number
    disponible: boolean
}

type EstadoItem = 'verificando' | 'ok' | 'no-disponible' | 'sin-verificar'

export default function CarritoPage() {
    const { items } = useCarrito()

    if (items.length === 0) {
        return <CarritoVacio />
    }

    const idsKey = items
        .map((item) => item.varianteId)
        .sort()
        .join(',')

    return <CarritoContenido key={idsKey} idsKey={idsKey} />
}

function CarritoVacio() {
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

function CarritoContenido({ idsKey }: { idsKey: string }) {
    const { items, quitarItem, cambiarCantidad } = useCarrito()
    const [validado, setValidado] = useState<Record<string, ItemValidado> | null>(null)
    const [errorValidacion, setErrorValidacion] = useState(false)

    useEffect(() => {
        const ids = idsKey.split(',')
        let cancelado = false

        fetch('/api/carrito', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ varianteIds: ids }),
        })
            .then((res) =>
                res.ok ? res.json() : Promise.reject(new Error('Error de verificación'))
            )
            .then((data: { items?: ItemValidado[] }) => {
                if (cancelado) return
                const mapa: Record<string, ItemValidado> = {}
                for (const item of data.items ?? []) mapa[item.varianteId] = item
                setValidado(mapa)
            })
            .catch(() => {
                if (!cancelado) setErrorValidacion(true)
            })

        return () => {
            cancelado = true
        }
    }, [idsKey])

    const itemsMostrados = items.map((item) => {
        const actual = validado?.[item.varianteId]
        let estado: EstadoItem
        if (errorValidacion) estado = 'sin-verificar'
        else if (validado === null) estado = 'verificando'
        else if (!actual || !actual.disponible) estado = 'no-disponible'
        else estado = 'ok'

        return {
            ...item,
            nombre: actual ? actual.nombre : item.nombre,
            marca: actual ? actual.marca : item.marca,
            imagen: actual ? actual.imagen : item.imagen,
            tamaño: actual ? actual.tamaño : item.tamaño,
            precio: actual ? actual.precio : item.precio,
            precioAnterior:
                actual && actual.disponible && actual.precio !== item.precio
                    ? item.precio
                    : null,
            estado,
        }
    })

    const itemsValidos = itemsMostrados.filter(
        (item) => item.estado === 'ok' || item.estado === 'sin-verificar'
    )
    const total = itemsValidos.reduce(
        (suma, item) => suma + item.precio * item.cantidad,
        0
    )
    const verificando = itemsMostrados.some((item) => item.estado === 'verificando')
    const sinDisponibles = !verificando && itemsValidos.length === 0

    function generarMensajeWhatsApp() {
        const lineas = itemsValidos.map(
            (item) =>
                `• ${item.nombre} (${item.tamaño}) x${item.cantidad} - ${formatearPrecio(item.precio * item.cantidad)}`
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

            {errorValidacion && (
                <p className="mb-6 rounded-sm border border-cobre/30 bg-cobre/5 px-4 py-3 text-sm text-humo">
                    No pudimos verificar los precios en línea. Los mostrados son los últimos
                    guardados; confírmalos por WhatsApp.
                </p>
            )}

            <div className="divide-y divide-alabastro">
                {itemsMostrados.map((item) => (
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
                                    {item.estado === 'no-disponible' && (
                                        <p className="mt-1 text-xs font-medium text-red-700">
                                            No disponible
                                        </p>
                                    )}
                                    {item.estado === 'verificando' && (
                                        <p className="mt-1 text-xs text-nude">
                                            Verificando disponibilidad…
                                        </p>
                                    )}
                                    {item.precioAnterior !== null && item.estado === 'ok' && (
                                        <p className="mt-1 text-xs text-cobre">
                                            Precio actualizado (antes{' '}
                                            {formatearPrecio(item.precioAnterior)})
                                        </p>
                                    )}
                                </div>
                                <p
                                    className={`font-serif text-base sm:text-lg shrink-0 ${
                                        item.estado === 'no-disponible'
                                            ? 'text-nude line-through'
                                            : 'text-humo'
                                    }`}
                                >
                                    {formatearPrecio(item.precio * item.cantidad)}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                                <button
                                    onClick={() =>
                                        cambiarCantidad(item.varianteId, item.cantidad - 1)
                                    }
                                    className="w-9 h-9 md:w-8 md:h-8 border rounded-sm text-base leading-none text-humo border-alabastro flex items-center justify-center"
                                    aria-label="Disminuir cantidad"
                                >
                                    −
                                </button>
                                <span className="text-sm w-6 text-center text-humo tabular-nums">
                                    {item.cantidad}
                                </span>
                                <button
                                    onClick={() =>
                                        cambiarCantidad(item.varianteId, item.cantidad + 1)
                                    }
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
                <span className="text-cobre text-[11px] tracking-[0.2em] uppercase">
                    Total
                </span>
                <span className="font-serif text-3xl text-humo">
                    {formatearPrecio(total)}
                </span>
            </div>

            {sinDisponibles ? (
                <p className="mt-8 text-center text-sm text-humo">
                    Ningún producto del carrito está disponible ahora mismo.
                </p>
            ) : verificando ? (
                <button
                    type="button"
                    disabled
                    className="mt-8 block w-full md:w-auto md:mx-auto md:min-w-[26rem] text-center py-4 md:py-5 px-10 rounded-md font-medium text-base md:text-lg tracking-wide opacity-60"
                    style={{ background: 'var(--humo)', color: 'var(--porcelana)' }}
                >
                    Verificando precios…
                </button>
            ) : (
                <a
                    href={generarMensajeWhatsApp()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 block w-full md:w-auto md:mx-auto md:min-w-[26rem] text-center py-4 md:py-5 px-10 rounded-md font-medium text-base md:text-lg tracking-wide transition hover:opacity-90"
                    style={{ background: 'var(--humo)', color: 'var(--porcelana)' }}
                >
                    Confirmar pedido por WhatsApp
                </a>
            )}

            <p className="text-xs text-center mt-3 text-nude">
                Te contactaremos para confirmar disponibilidad y coordinar envío.
            </p>
        </main>
    )
}
