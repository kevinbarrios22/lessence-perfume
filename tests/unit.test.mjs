import { test } from 'node:test'
import assert from 'node:assert/strict'
import { limpiarSlug } from '../lib/slug.ts'
import { claveImagenR2, hostImagenPermitido } from '../lib/imagen.ts'

test('limpiarSlug normaliza acentos, símbolos y guiones', () => {
    assert.equal(limpiarSlug('Café / Noir?'), 'cafe-noir')
    assert.equal(limpiarSlug("L'Eau #1"), 'l-eau-1')
    assert.equal(limpiarSlug('Millésime Impérial'), 'millesime-imperial')
    assert.equal(limpiarSlug('212 Men --- Aqua'), '212-men-aqua')
    assert.equal(limpiarSlug('  --Hola--  '), 'hola')
    assert.equal(limpiarSlug('???'), '')
})

test('hostImagenPermitido acepta R2/local y rechaza otros hosts', () => {
    assert.equal(hostImagenPermitido('https://pub-x.r2.dev/productos/a.avif'), true)
    assert.equal(
        hostImagenPermitido('https://cuenta.r2.cloudflarestorage.com/bucket/a.avif'),
        true
    )
    assert.equal(hostImagenPermitido('/logo.png'), true)
    assert.equal(hostImagenPermitido('data:image/png;base64,xx'), true)
    assert.equal(hostImagenPermitido('https://example.com/a.png'), false)
    assert.equal(hostImagenPermitido('https://r2.dev.evil.com/a.png'), false)
    assert.equal(hostImagenPermitido('no-es-url'), false)
})

test('claveImagenR2 solo devuelve claves de nuestro bucket', () => {
    process.env.R2_PUBLIC_URL = 'https://bucket.r2.dev/'
    assert.equal(
        claveImagenR2('https://bucket.r2.dev/productos/a.avif'),
        'productos/a.avif'
    )
    assert.equal(claveImagenR2('https://evil.com/productos/a.avif'), null)
    assert.equal(claveImagenR2('https://bucket.r2.dev/otros/a.avif'), null)
    assert.equal(claveImagenR2('https://bucket.r2.dev/productos/../secreto'), null)
    assert.equal(claveImagenR2(null), null)
})
