import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    construirMensajePedidoWhatsApp,
    crearUrlWhatsApp,
} from '../lib/pedido-whatsapp.ts'
import { agregarItemCarrito, resumirCarrito } from '../lib/carrito-estado.ts'

const precio = (n) => `$${n.toLocaleString('es-CO')}`

test('el mensaje del pedido incluye variantes, cantidades y total', () => {
    const mensaje = construirMensajePedidoWhatsApp(
        [
            { nombre: 'L’Eau d’Issey', tamaño: '100ml', cantidad: 2, precio: 84900 },
            { nombre: '212 Heroes', tamaño: '50ml', cantidad: 1, precio: 59900 },
        ],
        229700,
        precio
    )

    assert.equal(
        mensaje,
        [
            'Hola! Quiero consultar disponibilidad de:',
            '',
            '• L’Eau d’Issey (100ml) x2 - $169.800',
            '• 212 Heroes (50ml) x1 - $59.900',
            '',
            'Total: $229.700',
        ].join('\n')
    )
})

test('el enlace de WhatsApp codifica el mensaje para una URL segura', () => {
    const mensaje = 'Hola, quiero consultar: 212 Heroes (100ml) & envío'
    const url = crearUrlWhatsApp('573001112233', mensaje)
    const parsed = new URL(url)

    assert.equal(parsed.origin + parsed.pathname, 'https://wa.me/573001112233')
    assert.equal(parsed.searchParams.get('text'), mensaje)
})

test('el flujo del carrito produce un resumen y un enlace de pedido coherentes', () => {
    const nuevoItem = {
        productoId: 'producto-1',
        nombre: '212 Heroes',
        marca: 'Carolina Herrera',
        imagen: '/212.avif',
        varianteId: 'variante-100',
        tamaño: '100ml',
        precio: 84900,
    }
    const items = agregarItemCarrito(agregarItemCarrito([], nuevoItem), nuevoItem)
    const resumen = resumirCarrito(items)
    const mensaje = construirMensajePedidoWhatsApp(items, resumen.total, precio)
    const url = new URL(crearUrlWhatsApp('573001112233', mensaje))

    assert.equal(resumen.cantidadTotal, 2)
    assert.equal(resumen.total, 169800)
    assert.match(url.searchParams.get('text'), /212 Heroes \(100ml\) x2 - \$169\.800/)
    assert.match(url.searchParams.get('text'), /Total: \$169\.800/)
})
