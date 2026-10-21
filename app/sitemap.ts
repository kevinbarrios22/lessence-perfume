import type { MetadataRoute } from 'next'
import { listarSlugsParaSitemap } from '@/lib/productos'
import { siteUrl } from '@/lib/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = siteUrl()
    const filas = await listarSlugsParaSitemap()

    const productos: MetadataRoute.Sitemap = filas.map(({ slug, actualizadoEn }) => ({
        url: `${base}/producto/${slug}`,
        lastModified: actualizadoEn,
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    const ultimaActualizacion = filas.reduce(
        (maxima, fila) => (fila.actualizadoEn > maxima ? fila.actualizadoEn : maxima),
        new Date(0)
    )

    return [
        {
            url: base,
            lastModified: filas.length > 0 ? ultimaActualizacion : new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...productos,
    ]
}
