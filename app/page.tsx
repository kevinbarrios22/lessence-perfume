import { Suspense } from 'react'
import type { Metadata } from 'next'
import { buscarProductos, listarOpcionesFiltro } from '@/lib/productos'
import { listarBannersActivos } from '@/lib/banners'
import CarruselBanners from '@/components/CarruselBanners'
import FiltrosCatalogo from '@/components/FiltrosCatalogo'
import GrillaProductos from '@/components/GrillaProductos'
import Paginacion from '@/components/Paginacion'

export const metadata: Metadata = {
    alternates: { canonical: '/' },
}

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function primerValor(valor: string | string[] | undefined): string {
    return Array.isArray(valor) ? (valor[0] ?? '') : (valor ?? '')
}

async function conTiempoMaximo<T>(
    tarea: Promise<T>,
    respaldo: T,
    nombre: string,
    limiteMs = 5000,
): Promise<T> {
    let temporizador: ReturnType<typeof setTimeout> | undefined
    try {
        return await Promise.race([
            tarea,
            new Promise<T>((resolve) => {
                temporizador = setTimeout(() => {
                    console.error(`Tiempo agotado al cargar ${nombre}`)
                    resolve(respaldo)
                }, limiteMs)
            }),
        ])
    } finally {
        if (temporizador) clearTimeout(temporizador)
    }
}

export default async function Home({ searchParams }: Props) {
    const sp = await searchParams
    const q = primerValor(sp.q)
    const genero = primerValor(sp.genero)
    const marca = primerValor(sp.marca)
    const etiqueta = primerValor(sp.etiqueta)
    const pagina = Number(primerValor(sp.pagina)) || 1

    const [resultado, opciones, banners] = await Promise.all([
        conTiempoMaximo(
            buscarProductos({ q, genero, marca, etiqueta, pagina, porPagina: 12 }),
            { productos: [], total: 0, pagina: 1, totalPaginas: 1, error: true },
            'productos',
        ).catch((error) => {
            console.error('Error cargando productos', error)
            return { productos: [], total: 0, pagina: 1, totalPaginas: 1, error: true }
        }),
        conTiempoMaximo(
            listarOpcionesFiltro(),
            { marcas: [], generos: [], etiquetas: [] },
            'filtros',
        ).catch((error) => {
            console.error('Error cargando filtros', error)
            return { marcas: [], generos: [], etiquetas: [] }
        }),
        conTiempoMaximo(
            listarBannersActivos(),
            [],
            'banners',
        ).catch((error) => {
            console.error('Error cargando banners', error)
            return []
        }),
    ])

    const queryBase = new URLSearchParams()
    if (q) queryBase.set('q', q)
    if (genero) queryBase.set('genero', genero)
    if (marca) queryBase.set('marca', marca)
    if (etiqueta) queryBase.set('etiqueta', etiqueta)

    return (
        <main>
            <CarruselBanners banners={banners} />

            <section className="container-boutique pt-8 pb-8 md:pt-14 md:pb-12 text-center">
                <p className="text-cobre text-[10px] md:text-[11px] tracking-[0.3em] uppercase mb-4">
                    Perfumería selecta
                </p>
                <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-humo max-w-2xl mx-auto leading-tight">
                    Descubre tu verdadera esencia.
                </h1>
                <p className="text-sm md:text-base text-nude mt-4 max-w-md mx-auto">
                    Fragancias únicas. Recuerdos inolvidables.
                </p>
            </section>

            <section id="catalogo" className="container-boutique pt-4 pb-12 md:pt-6 md:pb-20">
                <h2 className="font-serif text-xl md:text-2xl tracking-tight text-humo mb-6 md:mb-8">
                    Fragancias
                </h2>

                <Suspense fallback={<div className="h-40" />}>
                    <FiltrosCatalogo
                        marcas={opciones.marcas}
                        generos={opciones.generos}
                        etiquetas={opciones.etiquetas}
                        total={resultado.total}
                    />
                </Suspense>

                {resultado.error ? (
                    <p className="text-sm text-nude text-center py-12" role="status">
                        No pudimos cargar las fragancias. Intenta actualizar la página en unos segundos.
                    </p>
                ) : resultado.productos.length === 0 ? (
                    <p className="text-sm text-nude text-center py-12">
                        No hay productos que coincidan con tu búsqueda.
                    </p>
                ) : (
                    <GrillaProductos productos={resultado.productos} />
                )}

                <Paginacion
                    pagina={resultado.pagina}
                    totalPaginas={resultado.totalPaginas}
                    queryBase={queryBase.toString()}
                />
            </section>
        </main>
    )
}
