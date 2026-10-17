import type { MetadataRoute } from 'next'
import { listarSlugsDisponibles } from '@/lib/productos'

export const revalidate = 3600

function baseUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = baseUrl()
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
