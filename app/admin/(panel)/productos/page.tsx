import Link from 'next/link'
import { listarTodosProductos } from '@/lib/productos'
import ListaProductos from './ListaProductos'
import AvisoExito from './AvisoExito'

export const metadata = { title: 'Productos' }
export const dynamic = 'force-dynamic'

export default async function ProductosPage({
    searchParams,
}: {
    searchParams: Promise<{ ok?: string }>
}) {
    const { ok } = await searchParams
    const productos = await listarTodosProductos()

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl tracking-tight text-humo">Productos</h1>
                    <p className="mt-1 text-sm text-nude">
                        {productos.length} {productos.length === 1 ? 'producto' : 'productos'} en el catálogo
                    </p>
                </div>
                <Link
                    href="/admin/productos/nuevo"
                    className="px-5 py-2.5 rounded-sm text-sm text-porcelana"
                    style={{ background: 'var(--humo)' }}
                >
                    Nuevo producto
                </Link>
            </div>

            {ok && <AvisoExito tipo={ok} />}

            <ListaProductos productos={productos} />
        </main>
    )
}
