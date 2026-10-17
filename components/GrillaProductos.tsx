import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { formatearPrecio } from '@/lib/formato'
import { limpiarSlug } from '@/lib/slug'
import { claseEtiqueta } from '@/lib/etiquetas'
import { estaAgotado, precioDesde } from '@/lib/catalogo'
import type { Producto } from '@/lib/productos'

export default function GrillaProductos({ productos }: { productos: Producto[] }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 md:gap-y-10">
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
    )
}
