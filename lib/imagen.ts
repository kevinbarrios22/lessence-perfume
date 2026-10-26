export const TIPOS_IMAGEN_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
]

export const MAX_IMAGEN_BYTES = 5 * 1024 * 1024

export const ACCEPT_IMAGEN = TIPOS_IMAGEN_PERMITIDOS.join(',')

export function formatearMB(bytes: number): string {
    return `${(bytes / 1048576).toFixed(1)} MB`
}

// Mantener en sync con images.remotePatterns de next.config.ts.
export const HOSTS_IMAGEN_PERMITIDOS = [
    'r2.dev',
    'r2.cloudflarestorage.com',
]

export function hostImagenPermitido(src: string): boolean {
    if (!src) return true
    if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('blob:')) return true
    try {
        const { hostname } = new URL(src)
        return HOSTS_IMAGEN_PERMITIDOS.some(
            (dominio) => hostname === dominio || hostname.endsWith(`.${dominio}`)
        )
    } catch {
        return false
    }
}

const PREFIJOS_R2 = ['productos/', 'banners/']

export function claveImagenR2(publicUrl: string | null | undefined): string | null {
    const base = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
    if (!base || !publicUrl || !publicUrl.startsWith(`${base}/`)) return null

    const key = publicUrl.slice(base.length + 1)
    if (!PREFIJOS_R2.some((prefijo) => key.startsWith(prefijo)) || key.includes('..')) {
        return null
    }
    return key
}

