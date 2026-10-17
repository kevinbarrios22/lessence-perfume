'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCarrito } from '@/lib/CarritoContext'
import { formatearPrecio } from '@/lib/formato'
import { claseEtiqueta } from '@/lib/etiquetas'
import { variantesDisponibles } from '@/lib/catalogo'
import ProductImage from '@/components/ProductImage'
import type { Producto, Variante } from '@/lib/productos'

export default function ProductoDetalle({ producto }: { producto: Producto }) {
  const { agregarItem } = useCarrito()
  const disponibles = variantesDisponibles(producto)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState<Variante | null>(
      disponibles[0] || null
  )
  const [agregado, setAgregado] = useState(false)

  function handleAgregar() {
    if (!varianteSeleccionada) return
    agregarItem({
      productoId: producto.id,
      nombre: producto.nombre,
      marca: producto.marca,
      imagen: producto.imagen_principal ?? '',
      varianteId: varianteSeleccionada.id,
      tamaño: varianteSeleccionada.tamaño,
      precio: varianteSeleccionada.precio,
    })
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  async function compartir() {
    const titulo = `${producto.marca} ${producto.nombre}`.trim()
    const url = window.location.href
    const texto = `Mirá ${titulo} en L'ESSENCE`
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url })
        return
      } catch {
        return
      }
    }
    window.open(
        `https://wa.me/?text=${encodeURIComponent(`${texto}: ${url}`)}`,
        '_blank',
        'noopener,noreferrer'
    )
  }

  const hayNotas = Boolean(
      producto.notas_salida || producto.notas_corazon || producto.notas_fondo
  )
  const agotado = disponibles.length === 0

  return (
      <main className="container-boutique py-8 md:py-14">
        <Link href="/#catalogo" className="text-sm text-nude hover:text-cobre">
          ← Volver al catálogo
        </Link>

        <div className="grid md:grid-cols-2 gap-10 md:gap-16 mt-6">
          <div className="md:sticky md:top-24 self-start">
            <ProductImage
                src={producto.imagen_principal}
                alt={producto.nombre}
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/5] rounded-sm"
            />
          </div>

          <div>
            <p className="text-cobre text-[11px] tracking-[0.2em] uppercase">
              {producto.marca}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl tracking-tight text-humo mt-2">
              {producto.nombre}
            </h1>
            {producto.etiquetas?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {producto.etiquetas.map((valorEtiqueta) => (
                      <span
                          key={valorEtiqueta}
                          className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.15em] ${claseEtiqueta(valorEtiqueta)}`}
                      >
                        {valorEtiqueta}
                      </span>
                  ))}
                </div>
            )}
            <p className="text-sm mt-2 text-nude">
              {producto.tipo} · {producto.genero}
            </p>

            {producto.descripcion && (
                <p className="mt-6 leading-relaxed text-humo">
                  {producto.descripcion}
                </p>
            )}

            {hayNotas && (
                <div className="mt-8 border-t border-alabastro pt-6">
                  <p className="text-cobre text-[11px] tracking-[0.2em] uppercase mb-3">
                    Notas
                  </p>
                  <dl className="space-y-2 text-sm">
                    {producto.notas_salida && (
                        <div>
                          <dt className="uppercase tracking-[0.15em] text-[10px] text-nude">Salida</dt>
                          <dd className="text-humo">{producto.notas_salida}</dd>
                        </div>
                    )}
                    {producto.notas_corazon && (
                        <div>
                          <dt className="uppercase tracking-[0.15em] text-[10px] text-nude">Corazón</dt>
                          <dd className="text-humo">{producto.notas_corazon}</dd>
                        </div>
                    )}
                    {producto.notas_fondo && (
                        <div>
                          <dt className="uppercase tracking-[0.15em] text-[10px] text-nude">Fondo</dt>
                          <dd className="text-humo">{producto.notas_fondo}</dd>
                        </div>
                    )}
                  </dl>
                </div>
            )}

            <div className="mt-8">
              <p className="text-cobre text-[11px] tracking-[0.2em] uppercase mb-3">Tamaño</p>
              {producto.variantes.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {producto.variantes.map((v) => {
                      const activo = varianteSeleccionada?.id === v.id
                      const sinStock = !v.disponible
                      return (
                          <button
                              key={v.id}
                              onClick={() => !sinStock && setVarianteSeleccionada(v)}
                              disabled={sinStock}
                              aria-pressed={activo}
                              className="px-5 py-2.5 md:py-2 min-h-[44px] inline-flex items-center rounded-sm text-sm border transition relative"
                              style={{
                                background: activo ? 'var(--humo)' : 'transparent',
                                color: activo
                                    ? 'var(--porcelana)'
                                    : sinStock
                                        ? 'var(--alabastro)'
                                        : 'var(--humo)',
                                borderColor: 'var(--alabastro)',
                                cursor: sinStock ? 'not-allowed' : 'pointer',
                              }}
                          >
                            {v.tamaño}
                            {sinStock && (
                                <span className="ml-2 text-[10px] uppercase tracking-[0.15em]">
                              Agotado
                            </span>
                            )}
                          </button>
                      )
                    })}
                  </div>
              ) : (
                  <p className="text-sm text-nude">Sin tamaños cargados.</p>
              )}

              {agotado && (
                  <p className="text-sm mt-3" style={{ color: 'var(--cobre)' }}>
                    Producto agotado por el momento.
                  </p>
              )}
            </div>

            {varianteSeleccionada && (
                <p className="font-serif text-3xl mt-6 text-humo">
                  {formatearPrecio(varianteSeleccionada.precio)}
                </p>
            )}

            <button
                onClick={handleAgregar}
                disabled={!varianteSeleccionada}
                className="mt-6 w-full py-4 md:py-5 rounded-md font-medium text-base md:text-lg tracking-wide transition hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--humo)', color: 'var(--porcelana)' }}
            >
              {agregado ? '✓ Agregado' : agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>

            <button
                type="button"
                onClick={compartir}
                className="mt-3 w-full py-3 rounded-md text-sm border border-alabastro text-humo transition-colors hover:border-cobre inline-flex items-center justify-center gap-2"
            >
              <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Compartir
            </button>
          </div>
        </div>
      </main>
  )
}