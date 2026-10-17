import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { formatearPrecio } from '@/lib/formato'
import { estaAgotado, precioDesde } from '@/lib/catalogo'
import BotonEliminar from './BotonEliminar'
import type { Producto } from '@/lib/productos'

export default function ListaProductos({
    productos,
    hayFiltros,
}: {
    productos: Producto[]
    hayFiltros: boolean
}) {
    if (productos.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-alabastro py-16 text-center text-sm text-nude">
                {hayFiltros
                    ? 'No hay productos que coincidan con el filtro.'
                    : 'Todavía no hay productos cargados.'}
            </div>
        )
    }

    return (
        <ul className="space-y-3">
            {productos.map((p) => (
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
    )
}
