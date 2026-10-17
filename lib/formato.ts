export function formatearPrecio(n: number): string {
    if (!Number.isFinite(n)) return '$0'
    return '$' + Math.round(n).toLocaleString('es-UY')
}