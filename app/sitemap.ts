import type { MetadataRoute } from 'next'
import { listarSlugsDisponibles } from '@/lib/productos'
import { siteUrl } from '@/lib/config'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = siteUrl()
    const slugs = await listarSlugsDisponibles()
    const ahora = new Date()

    const productos: MetadataRoute.Sitemap = slugs.map((slug) => ({
        url: `${base}/producto/${slug}`,
        lastModified: ahora,
        changeFrequency: 'weekly',
        priority: 0.8,
    }))

    return [
        {
            url: base,
            lastModified: ahora,
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...productos,
    ]
}
