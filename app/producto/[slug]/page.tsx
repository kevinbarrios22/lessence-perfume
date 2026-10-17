import type { Metadata } from 'next'
import { listarSlugsDisponibles, obtenerProductoPorSlug } from '@/lib/productos'
import { MONEDA } from '@/lib/formato'
import { notFound } from 'next/navigation'
import ProductoDetalle from './ProductoDetalle'

export const revalidate = 3600

export async function generateStaticParams() {
    const slugs = await listarSlugsDisponibles()
    return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
                                           params,
                                       }: {
    params: Promise<{ slug: string }>
}): Promise<Metadata> {
    const { slug } = await params
    const producto = await obtenerProductoPorSlug(slug)

    if (!producto) {
        return { title: 'Producto' }
    }

    const titulo = `${producto.marca} ${producto.nombre}`.trim()
    const descripcion = producto.descripcion || undefined
    const imagenes = producto.imagen_principal ? [producto.imagen_principal] : undefined

    return {
        title: titulo,
        description: descripcion,
        alternates: { canonical: `/producto/${producto.slug}` },
        openGraph: {
            title: titulo,
            description: descripcion,
            type: 'website',
            locale: 'es_UY',
            siteName: 'L\'ESSENCE',
            url: `/producto/${producto.slug}`,
            ...(imagenes ? { images: imagenes } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: titulo,
            description: descripcion,
            ...(imagenes ? { images: imagenes } : {}),
        },
    }
}

export default async function ProductoPage({
                                               params,
                                           }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const producto = await obtenerProductoPorSlug(slug)

    if (!producto) {
        notFound()
    }

    const variantesDisponibles = producto.variantes.filter((v) => v.disponible)
    const precios = (variantesDisponibles.length ? variantesDisponibles : producto.variantes).map(
        (v) => v.precio
    )
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: `${producto.marca} ${producto.nombre}`.trim(),
        description: producto.descripcion || undefined,
        image: producto.imagen_principal ? [producto.imagen_principal] : undefined,
        brand: producto.marca ? { '@type': 'Brand', name: producto.marca } : undefined,
        category: producto.tipo || undefined,
        ...(precios.length
            ? {
                offers: {
                    '@type': 'AggregateOffer',
                    priceCurrency: MONEDA,
                    lowPrice: Math.min(...precios),
                    highPrice: Math.max(...precios),
                    offerCount: producto.variantes.length,
                    availability:
                        variantesDisponibles.length > 0
                            ? 'https://schema.org/InStock'
                            : 'https://schema.org/OutOfStock',
                },
            }
            : {}),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
                }}
            />
            <ProductoDetalle producto={producto} />
        </>
    )
}
