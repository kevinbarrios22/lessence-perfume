export const SITIO_NOMBRE = "L'ESSENCE"

export const MONEDA = 'COP'
export const LOCALE = 'es-CO'

export const WHATSAPP_NUMERO =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '573228759145'

export function siteUrl(): string {
    return (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}
