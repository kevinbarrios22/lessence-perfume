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
