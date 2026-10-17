'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { formatearPrecio } from '@/lib/formato'
import { estaAgotado, precioDesde } from '@/lib/catalogo'
import BotonEliminar from './BotonEliminar'
import type { Producto } from '@/lib/productos'

type Estado = 'Todos' | 'Visible' | 'Oculto'

const chipBase = 'px-3 py-1.5 rounded-full text-xs border transition-colors'

export default function ListaProductos({ productos }: { productos: Producto[] }) {
    const [busqueda, setBusqueda] = useState('')
    const [estado, setEstado] = useState<Estado>('Todos')

    const filtrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase()
        return productos.filter((p) => {
            const coincideTexto = q === '' || `${p.nombre} ${p.marca}`.toLowerCase().includes(q)
            const coincideEstado =
                estado === 'Todos' ||
                (estado === 'Visible' ? p.disponible : !p.disponible)
            return coincideTexto && coincideEstado
        })
    }, [productos, busqueda, estado])

    const estados: Estado[] = ['Todos', 'Visible', 'Oculto']

    return (
        <div>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="search"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o marca…"
                    aria-label="Buscar productos"
                    className="w-full rounded-sm border border-alabastro bg-white px-3 py-2 text-sm text-humo outline-none focus:border-cobre sm:max-w-xs"
                />
                <div className="flex items-center gap-1.5">
                    {estados.map((e) => (
                        <button
                            key={e}
                            type="button"
                            onClick={() => setEstado(e)}
                            aria-pressed={estado === e}
                            className={`${chipBase} ${
                                estado === e
                                    ? 'bg-humo text-porcelana border-humo'
                                    : 'border-alabastro text-humo hover:border-cobre'
                            }`}
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>

            {filtrados.length === 0 ? (
                <div className="rounded-md border border-dashed border-alabastro py-16 text-center text-sm text-nude">
                    {productos.length === 0
                        ? 'Todavía no hay productos cargados.'
                        : 'No hay productos que coincidan con el filtro.'}
                </div>
            ) : (
                <ul className="space-y-3">
                    {filtrados.map((p) => (
                        <li
                            key={p.id}
                            className="flex items-start gap-4 rounded-md border border-alabastro bg-white p-4"
                        >
                            <ProductImage
                                src={p.imagen_principal}
                                alt={p.nombre}
                                sizes="96px"
                                className="w-16 h-20 shrink-0 rounded-sm"
                            />

                            <div className="min-w-0 flex-1">
                                <p className="text-cobre text-[10px] tracking-[0.15em] uppercase">
                                    {p.marca}
                                </p>
                                <p className="truncate font-serif text-base text-humo">
                                    {p.nombre}
                                </p>
                                <p className="text-xs text-nude">
                                    {p.variantes.length} tamaño(s)
                                    {p.variantes.length > 0 &&
                                        ` · desde ${formatearPrecio(precioDesde(p.variantes))}`}
                                </p>
                                {p.etiquetas?.length > 0 && (
                                    <div className="mt-1.5 flex flex-wrap gap-1">
                                        {p.etiquetas.map((valorEtiqueta) => (
                                            <span
                                                key={valorEtiqueta}
                                                className="rounded-full bg-porcelana px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-cobre"
                                            >
                                                {valorEtiqueta}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                                <div className="flex flex-wrap items-center justify-end gap-2">
                                    {estaAgotado(p) && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-amber-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            Sin stock
                                        </span>
                                    )}
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${
                                            p.disponible
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-neutral-100 text-neutral-500'
                                        }`}
                                    >
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                        {p.disponible ? 'Visible' : 'Oculto'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/productos/${p.id}`}
                                        className="px-3 py-1.5 rounded-sm text-xs border border-alabastro text-humo transition-colors hover:border-cobre"
                                    >
                                        Editar
                                    </Link>
                                    <BotonEliminar id={p.id} nombre={p.nombre} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
