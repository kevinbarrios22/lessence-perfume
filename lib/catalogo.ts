import type { Producto, Variante } from '@/lib/productos'

export function variantesDisponibles(producto: Producto): Variante[] {
    return producto.variantes.filter((v) => v.disponible)
}

export function estaAgotado(producto: Producto): boolean {
    return producto.variantes.filter((v) => v.disponible).length === 0
}

export function precioDesde(variantes: { precio: number }[]): number {
    const precios = variantes.map((v) => v.precio).filter((p) => Number.isFinite(p))
    return precios.length ? Math.min(...precios) : 0
}
