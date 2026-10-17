'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { formatearPrecio } from '@/lib/formato'
import { limpiarSlug } from '@/lib/slug'
import { claseEtiqueta, ETIQUETAS_DISPONIBLES } from '@/lib/etiquetas'
import type { Producto } from '@/lib/productos'

function precioDesde(variantes: { precio: number }[]): number {
  const precios = variantes.map((v) => v.precio).filter((p) => Number.isFinite(p))
  return precios.length ? Math.min(...precios) : 0
}

function estaAgotado(producto: Producto): boolean {
  return producto.variantes.filter((v) => v.disponible).length === 0
}

function valoresUnicos(valores: string[]): string[] {
  return Array.from(new Set(valores.filter((v) => v.trim() !== ''))).sort((a, b) =>
    a.localeCompare(b, 'es')
  )
}

const chipBase =
  'px-3.5 py-1.5 rounded-full text-xs sm:text-sm border transition-colors whitespace-nowrap'

export default function CatalogoCliente({ productos }: { productos: Producto[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [genero, setGenero] = useState('Todos')
  const [marca, setMarca] = useState('Todos')
  const [etiqueta, setEtiqueta] = useState('Todas')

  const generos = useMemo(
    () => ['Todos', ...valoresUnicos(productos.map((p) => p.genero))],
    [productos]
  )
  const marcas = useMemo(
    () => ['Todos', ...valoresUnicos(productos.map((p) => p.marca))],
    [productos]
  )
  const etiquetas = useMemo(() => {
    const presentes = new Set(productos.flatMap((p) => p.etiquetas ?? []))
    return ETIQUETAS_DISPONIBLES.filter((valorEtiqueta) => presentes.has(valorEtiqueta))
  }, [productos])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      const coincideTexto = q === '' || `${p.nombre} ${p.marca}`.toLowerCase().includes(q)
      const coincideGenero = genero === 'Todos' || p.genero === genero
      const coincideMarca = marca === 'Todos' || p.marca === marca
      const coincideEtiqueta = etiqueta === 'Todas' || (p.etiquetas ?? []).includes(etiqueta)
      return coincideTexto && coincideGenero && coincideMarca && coincideEtiqueta
    })
  }, [productos, busqueda, genero, marca, etiqueta])

  const hayFiltros =
    busqueda.trim() !== '' || genero !== 'Todos' || marca !== 'Todos' || etiqueta !== 'Todas'

  function chipClass(activo: boolean): string {
    return `${chipBase} ${
      activo
        ? 'bg-humo text-porcelana border-humo'
        : 'border-alabastro text-humo hover:border-cobre'
    }`
  }

  return (
    <div>
      <div className="mb-6 md:mb-8 space-y-4 max-w-2xl">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-nude"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o marca…"
            aria-label="Buscar productos"
            className="w-full rounded-sm border border-alabastro bg-white pl-10 pr-3 py-2.5 text-sm text-humo outline-none focus:border-cobre"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-cobre text-[11px] tracking-[0.2em] uppercase mr-1">
            Género
          </span>
          {generos.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenero(g)}
              aria-pressed={genero === g}
              className={chipClass(genero === g)}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-cobre text-[11px] tracking-[0.2em] uppercase mr-1">
            Marca
          </span>
          {marcas.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMarca(m)}
              aria-pressed={marca === m}
              className={chipClass(marca === m)}
            >
              {m}
            </button>
          ))}
        </div>

        {etiquetas.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-cobre text-[11px] tracking-[0.2em] uppercase mr-1">
              Etiqueta
            </span>
            {['Todas', ...etiquetas].map((valorEtiqueta) => (
              <button
                key={valorEtiqueta}
                type="button"
                onClick={() => setEtiqueta(valorEtiqueta)}
                aria-pressed={etiqueta === valorEtiqueta}
                className={chipClass(etiqueta === valorEtiqueta)}
              >
                {valorEtiqueta}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-nude">
          <span>
            {filtrados.length} {filtrados.length === 1 ? 'producto' : 'productos'}
          </span>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('')
                setGenero('Todos')
                setMarca('Todos')
                setEtiqueta('Todas')
              }}
              className="underline hover:text-cobre"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-nude text-center py-12">
          No hay productos que coincidan con tu búsqueda.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 md:gap-y-10">
          {filtrados.map((producto) => {
            const agotado = estaAgotado(producto)
            return (
              <Link
                key={producto.id}
                href={`/producto/${limpiarSlug(producto.slug)}`}
                className="group block"
              >
                <div className="relative mb-3">
                  <ProductImage
                    src={producto.imagen_principal}
                    alt={producto.nombre}
                    sizes="(min-width: 768px) 33vw, 50vw"
                    className="aspect-[4/5] rounded-sm transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {producto.etiquetas?.length > 0 && (
                    <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
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
                  {agotado && (
                    <span className="absolute right-2 top-2 rounded-full bg-humo/90 px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-porcelana">
                      Agotado
                    </span>
                  )}
                </div>
                <p className="text-cobre text-[10px] md:text-[11px] tracking-[0.15em] md:tracking-[0.2em] uppercase mb-1 text-center">
                  {producto.marca}
                </p>
                <h3 className="font-serif text-sm md:text-base lg:text-lg tracking-tight text-humo text-center leading-snug">
                  {producto.nombre}
                </h3>
                {agotado ? (
                  <p className="text-xs md:text-sm text-center mt-1 text-nude">Agotado</p>
                ) : (
                  <p className="text-xs md:text-sm text-center mt-1 text-nude">
                    Desde {formatearPrecio(precioDesde(producto.variantes))}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
