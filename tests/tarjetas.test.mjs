import { after, before, test } from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
let vite
let GrillaProductos
let ProductoDetalle
let CarritoProvider

before(async () => {
    vite = await createServer({
        configFile: false,
        root: projectRoot,
        appType: 'custom',
        plugins: [react()],
        resolve: {
            alias: [
                { find: 'next/link', replacement: path.join(projectRoot, 'tests/mocks/NextLink.tsx') },
                { find: 'next/image', replacement: path.join(projectRoot, 'tests/mocks/NextImage.tsx') },
                { find: '@', replacement: projectRoot },
            ],
        },
        server: { middlewareMode: true },
        logLevel: 'error',
    })

    GrillaProductos = (await vite.ssrLoadModule('/components/GrillaProductos.tsx')).default
    ProductoDetalle = (await vite.ssrLoadModule('/app/producto/[slug]/ProductoDetalle.tsx')).default
    CarritoProvider = (await vite.ssrLoadModule('/lib/CarritoContext.tsx')).CarritoProvider
})

after(async () => {
    await vite?.close()
})

const producto = (overrides = {}) => ({
    id: 'producto-1',
    nombre: '212 Heroes',
    marca: 'Carolina Herrera',
    slug: '212-heroes',
    descripcion: 'Fragancia fresca para el día.',
    genero: 'Masculino',
    tipo: 'Eau de Toilette',
    imagen_principal: 'https://pub-x.r2.dev/productos/212.avif',
    disponible: true,
    etiquetas: [],
    variantes: [
        { id: 'variante-100', tamaño: '100ml', precio: 84900, disponible: true },
        { id: 'variante-50', tamaño: '50ml', precio: 59900, disponible: false },
    ],
    ...overrides,
})

test('las tarjetas conservan encuadre, jerarquía, precio y enlace del producto', () => {
    const html = renderToStaticMarkup(
        createElement(GrillaProductos, { productos: [producto()] })
    )

    assert.match(html, /href="\/producto\/212-heroes"/)
    assert.match(html, /aspect-\[4\/5\]/)
    assert.match(html, /object-contain p-3 sm:p-5/)
    assert.match(html, /Carolina Herrera/i)
    assert.match(html, /212 Heroes/)
    assert.match(html, /Desde/)
    assert.match(html, /84\.900/)
})

test('la tarjeta mantiene título y placeholder de imagen accesibles, y muestra agotado', () => {
    const agotado = producto({
        id: 'producto-2',
        nombre: 'Un perfume con un nombre muy largo para la tarjeta',
        slug: 'nombre-largo',
        imagen_principal: null,
        variantes: [{ id: 'variante-3', tamaño: '100ml', precio: 84900, disponible: false }],
    })
    const html = renderToStaticMarkup(
        createElement(GrillaProductos, { productos: [agotado] })
    )

    assert.match(html, /line-clamp-2/)
    assert.match(html, /aria-label="Un perfume con un nombre muy largo para la tarjeta"/)
    assert.match(html, /Agotado/)
})

test('las tres primeras tarjetas priorizan su imagen y las siguientes no', () => {
    const productos = Array.from({ length: 4 }, (_, index) =>
        producto({ id: `producto-${index}`, slug: `perfume-${index}`, nombre: `Perfume ${index}` })
    )
    const html = renderToStaticMarkup(createElement(GrillaProductos, { productos }))
    const prioridades = [...html.matchAll(/data-priority="(true|false)"/g)].map((match) => match[1])

    assert.deepEqual(prioridades, ['true', 'true', 'true', 'false'])
})

test('la ficha selecciona el primer tamaño disponible y desactiva los agotados', () => {
    const html = renderToStaticMarkup(
        createElement(
            CarritoProvider,
            null,
            createElement(ProductoDetalle, { producto: producto() })
        )
    )

    assert.match(html, /100ml/)
    assert.match(html, /aria-pressed="true"/)
    assert.match(html, /50ml/)
    assert.match(html, /Agotado/)
    assert.match(html, /disabled=""/)
    assert.match(html, /Agregar al carrito/)
})

test('una ficha sin variantes disponibles desactiva agregar al carrito', () => {
    const sinStock = producto({
        variantes: [{ id: 'variante-3', tamaño: '100ml', precio: 84900, disponible: false }],
    })
    const html = renderToStaticMarkup(
        createElement(
            CarritoProvider,
            null,
            createElement(ProductoDetalle, { producto: sinStock })
        )
    )

    assert.match(html, /Producto agotado por el momento/)
    assert.match(html, /<button[^>]*disabled=""[^>]*>Agotado<\/button>/)
})
