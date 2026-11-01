import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    agregarItemCarrito,
    cambiarCantidadCarrito,
    leerItemsCarrito,
    quitarItemCarrito,
    resumirCarrito,
} from '../lib/carrito-estado.ts'

const nuevoItem = {
    productoId: 'producto-1',
    nombre: '212 Heroes',
    marca: 'Carolina Herrera',
    imagen: '/212.avif',
    varianteId: 'variante-100',
    tamaño: '100ml',
    precio: 84900,
}

test('agregar una variante nueva la añade con cantidad uno', () => {
    assert.deepEqual(agregarItemCarrito([], nuevoItem), [{ ...nuevoItem, cantidad: 1 }])
})

test('agregar otra vez la misma variante incrementa cantidad sin duplicar la línea', () => {
    const unaUnidad = [{ ...nuevoItem, cantidad: 1 }]
    assert.deepEqual(agregarItemCarrito(unaUnidad, nuevoItem), [{ ...nuevoItem, cantidad: 2 }])
})

test('cambiar cantidad actualiza la variante correcta y cero la quita', () => {
    const items = [
        { ...nuevoItem, cantidad: 1 },
        { ...nuevoItem, varianteId: 'variante-50', tamaño: '50ml', cantidad: 2 },
    ]
    assert.equal(cambiarCantidadCarrito(items, 'variante-100', 3)[0].cantidad, 3)
    assert.deepEqual(cambiarCantidadCarrito(items, 'variante-100', 0), [items[1]])
    assert.deepEqual(quitarItemCarrito(items, 'variante-50'), [items[0]])
})

test('leer el carrito descarta datos corruptos o incompletos sin romper la carga', () => {
    assert.deepEqual(leerItemsCarrito('{mal json'), [])
    assert.deepEqual(leerItemsCarrito('null'), [])
    assert.deepEqual(leerItemsCarrito(JSON.stringify([
        { ...nuevoItem, cantidad: 1 },
        { ...nuevoItem, cantidad: -1 },
        { ...nuevoItem, precio: Number.NaN },
    ])), [{ ...nuevoItem, cantidad: 1 }])
})

test('el resumen calcula total y unidades de todas las variantes', () => {
    assert.deepEqual(
        resumirCarrito([
            { ...nuevoItem, cantidad: 2 },
            { ...nuevoItem, varianteId: 'variante-50', precio: 59900, cantidad: 1 },
        ]),
        { total: 229700, cantidadTotal: 3 }
    )
    assert.deepEqual(resumirCarrito([]), { total: 0, cantidadTotal: 0 })
})
