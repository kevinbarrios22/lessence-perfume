import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/config'

export default function robots(): MetadataRoute.Robots {
    const base = siteUrl()
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/carrito'],
        },
        sitemap: `${base}/sitemap.xml`,
    }
}
