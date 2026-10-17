import { Suspense } from 'react'
import Link from 'next/link'
import { listarProductosAdmin, type EstadoProducto } from '@/lib/productos'
import Paginacion from '@/components/Paginacion'
import ListaProductos from './ListaProductos'
import FiltrosAdmin from './FiltrosAdmin'
import AvisoExito from './AvisoExito'

export const metadata = { title: 'Productos' }
export const dynamic = 'force-dynamic'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function primerValor(valor: string | string[] | undefined): string {
    return Array.isArray(valor) ? (valor[0] ?? '') : (valor ?? '')
}

export default async function ProductosPage({ searchParams }: Props) {
    const sp = await searchParams
    const ok = primerValor(sp.ok)
    const q = primerValor(sp.q)
    const estadoBruto = primerValor(sp.estado)
    const estado: EstadoProducto =
        estadoBruto === 'visible' || estadoBruto === 'oculto' ? estadoBruto : 'todos'
    const pagina = Number(primerValor(sp.pagina)) || 1

    const resultado = await listarProductosAdmin({ q, estado, pagina, porPagina: 20 })

    const queryBase = new URLSearchParams()
    if (q.trim()) queryBase.set('q', q.trim())
    if (estado !== 'todos') queryBase.set('estado', estado)

    const hayFiltros = Boolean(q.trim()) || estado !== 'todos'

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <h1 className="font-serif text-2xl tracking-tight text-humo">Productos</h1>
                <Link
                    href="/admin/productos/nuevo"
                    className="px-5 py-2.5 rounded-sm text-sm text-porcelana"
                    style={{ background: 'var(--humo)' }}
                >
                    Nuevo producto
                </Link>
            </div>

            {ok && <AvisoExito tipo={ok} />}

            <Suspense fallback={<div className="h-20" />}>
                <FiltrosAdmin total={resultado.total} />
            </Suspense>

            <ListaProductos productos={resultado.productos} hayFiltros={hayFiltros} />

            <Paginacion
                pagina={resultado.pagina}
                totalPaginas={resultado.totalPaginas}
                queryBase={queryBase.toString()}
                basePath="/admin/productos"
                ancla=""
            />
        </main>
    )
}
