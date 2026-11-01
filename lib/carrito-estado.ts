export type ItemCarrito = {
    productoId: string
    nombre: string
    marca: string
    imagen: string
    varianteId: string
    tamaño: string
    precio: number
    cantidad: number
}

export type NuevoItemCarrito = Omit<ItemCarrito, 'cantidad'>

export function esItemCarritoValido(valor: unknown): valor is ItemCarrito {
    if (typeof valor !== 'object' || valor === null) return false
    const item = valor as Record<string, unknown>
    return (
        typeof item.productoId === 'string' &&
        typeof item.nombre === 'string' &&
        typeof item.marca === 'string' &&
        typeof item.imagen === 'string' &&
        typeof item.varianteId === 'string' &&
        typeof item.tamaño === 'string' &&
        typeof item.precio === 'number' &&
        Number.isFinite(item.precio) &&
        typeof item.cantidad === 'number' &&
        Number.isFinite(item.cantidad) &&
        item.cantidad > 0
    )
}

export function leerItemsCarrito(raw: string | null): ItemCarrito[] {
    if (!raw) return []
    try {
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(esItemCarritoValido) : []
    } catch {
        return []
    }
}

export function agregarItemCarrito(
    items: ItemCarrito[],
    nuevo: NuevoItemCarrito
): ItemCarrito[] {
    const existente = items.find((item) => item.varianteId === nuevo.varianteId)
    if (existente) {
        return items.map((item) =>
            item.varianteId === nuevo.varianteId
                ? { ...item, cantidad: item.cantidad + 1 }
                : item
        )
    }
    return [...items, { ...nuevo, cantidad: 1 }]
}

export function quitarItemCarrito(items: ItemCarrito[], varianteId: string): ItemCarrito[] {
    return items.filter((item) => item.varianteId !== varianteId)
}

export function cambiarCantidadCarrito(
    items: ItemCarrito[],
    varianteId: string,
    cantidad: number
): ItemCarrito[] {
    if (cantidad <= 0) return quitarItemCarrito(items, varianteId)
    return items.map((item) =>
        item.varianteId === varianteId ? { ...item, cantidad } : item
    )
}

export function resumirCarrito(items: ItemCarrito[]): {
    total: number
    cantidadTotal: number
} {
    return items.reduce(
        (resumen, item) => ({
            total: resumen.total + item.precio * item.cantidad,
            cantidadTotal: resumen.cantidadTotal + item.cantidad,
        }),
        { total: 0, cantidadTotal: 0 }
    )
}
