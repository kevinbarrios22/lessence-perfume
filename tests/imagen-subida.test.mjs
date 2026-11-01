import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MAX_IMAGEN_BYTES, validarImagenSubida } from '../lib/imagen.ts'
import { subirImagenFirmada } from '../lib/subida-imagen.ts'

test('la validación permite JPG, PNG, WEBP y AVIF dentro del límite', () => {
    for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/avif']) {
        assert.equal(validarImagenSubida(mime, 1), null)
        assert.equal(validarImagenSubida(mime, MAX_IMAGEN_BYTES), null)
    }
})

test('la validación rechaza formatos ajenos y tamaños vacíos, inválidos o superiores a 5 MB', () => {
    assert.equal(validarImagenSubida('image/gif', 100), 'formato')
    assert.equal(validarImagenSubida('image/png', 0), 'tamaño')
    assert.equal(validarImagenSubida('image/png', Number.NaN), 'tamaño')
    assert.equal(validarImagenSubida('image/png', MAX_IMAGEN_BYTES + 1), 'tamaño')
})

test('la carga firmada usa PUT, el archivo y el Content-Type original', async () => {
    const archivo = new File(['imagen'], 'producto.png', { type: 'image/png' })
    let llamada
    const fetchFalso = async (...args) => {
        llamada = args
        return new Response(null, { status: 200 })
    }

    await subirImagenFirmada('https://r2.test/signed', archivo, fetchFalso)

    assert.equal(llamada[0], 'https://r2.test/signed')
    assert.equal(llamada[1].method, 'PUT')
    assert.equal(llamada[1].body, archivo)
    assert.equal(llamada[1].headers['Content-Type'], 'image/png')
})

test('la carga firmada falla con respuesta HTTP no exitosa y propaga errores de red', async () => {
    const archivo = new File(['imagen'], 'producto.png', { type: 'image/png' })
    await assert.rejects(
        subirImagenFirmada('https://r2.test/signed', archivo, async () => new Response(null, { status: 403 })),
        /403/
    )
    await assert.rejects(
        subirImagenFirmada('https://r2.test/signed', archivo, async () => { throw new TypeError('network') }),
        /network/
    )
})
