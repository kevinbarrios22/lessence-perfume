export type ItemPedidoWhatsApp = {
    nombre: string
    tamaño: string
    cantidad: number
    precio: number
}

export function construirMensajePedidoWhatsApp(
    items: ItemPedidoWhatsApp[],
    total: number,
    formatearPrecio: (precio: number) => string
): string {
    const lineas = items.map(
        (item) =>
            `• ${item.nombre} (${item.tamaño}) x${item.cantidad} - ${formatearPrecio(item.precio * item.cantidad)}`
    )
    return [
        'Hola! Quiero consultar disponibilidad de:',
        '',
        ...lineas,
        '',
        `Total: ${formatearPrecio(total)}`,
    ].join('\n')
}

export function crearUrlWhatsApp(numero: string, mensaje: string): string {
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`
}
