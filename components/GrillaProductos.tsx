import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { formatearPrecio } from '@/lib/formato'
import { limpiarSlug } from '@/lib/slug'
import { claseEtiqueta } from '@/lib/etiquetas'
import { estaAgotado, precioDesde } from '@/lib/catalogo'
import type { Producto } from '@/lib/productos'

export default function GrillaProductos({ productos }: { productos: Producto[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-9 md:gap-y-11">
            {productos.map((producto, index) => {
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
                                priority={index < 3}
                                sizes="(min-width: 768px) 33vw, 50vw"
                                fit="contain"
                                imageClassName="p-3 sm:p-5 transition-transform duration-500 group-hover:scale-[1.04]"
                                className="aspect-[4/5] rounded-sm bg-[#eee8de] transition-colors duration-300 group-hover:bg-[#f8f5ef]"
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
                        <p className="mb-1 min-h-4 truncate text-left text-[10px] uppercase tracking-[0.16em] text-cobre md:text-[11px] md:tracking-[0.2em]">
                            {producto.marca}
                        </p>
                        <h3 className="min-h-[2.6em] line-clamp-2 font-serif text-base leading-snug tracking-tight text-humo md:text-lg">
                            {producto.nombre}
                        </h3>
                        {agotado ? (
                            <p className="mt-1 text-xs font-medium text-nude md:text-sm">Agotado</p>
                        ) : (
                            <p className="mt-1 flex items-baseline gap-1.5 text-xs md:text-sm">
                                <span className="text-[10px] uppercase tracking-[0.12em] text-cobre">Desde</span>
                                <span className="font-medium text-humo">{formatearPrecio(precioDesde(producto.variantes))}</span>
                            </p>
                        )}
                    </Link>
                )
            })}
        </div>
    )
}
