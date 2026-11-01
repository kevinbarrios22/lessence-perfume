import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    calcularPaginacion,
    construirWhereCatalogo,
    normalizarPorPagina,
} from '../lib/catalogo-consulta.ts'
import { estaAgotado, precioDesde, variantesDisponibles } from '../lib/catalogo.ts'

const producto = {
    id: 'producto-1',
    nombre: '212 Heroes',
    marca: 'Carolina Herrera',
    slug: '212-heroes',
    descripcion: '',
    genero: 'Masculino',
    tipo: 'Eau de Toilette',
    imagen_principal: null,
    disponible: true,
    etiquetas: [],
    variantes: [
        { id: 'variante-1', tamaño: '100ml', precio: 84900, disponible: true },
        { id: 'variante-2', tamaño: '50ml', precio: 59900, disponible: false },
    ],
}

test('el catálogo devuelve solo variantes disponibles y marca agotado cuando no queda ninguna', () => {
    assert.deepEqual(variantesDisponibles(producto).map((variante) => variante.id), ['variante-1'])
    assert.equal(estaAgotado(producto), false)
    assert.equal(
        estaAgotado({ ...producto, variantes: producto.variantes.map((v) => ({ ...v, disponible: false })) }),
        true
    )
})

test('precioDesde prioriza tamaños disponibles y devuelve cero si no hay precios finitos', () => {
    assert.equal(precioDesde(producto.variantes), 84900)
    assert.equal(precioDesde(producto.variantes.map((variante) => ({ ...variante, disponible: false }))), 59900)
    assert.equal(precioDesde([{ precio: 100 }, { precio: 50 }]), 50)
    assert.equal(precioDesde([{ precio: Number.NaN }, { precio: Number.POSITIVE_INFINITY }]), 0)
})

test('el catálogo combina búsqueda y filtros con parámetros SQL, sin interpolar valores', () => {
    const resultado = construirWhereCatalogo({
        q: '  212%\' OR true --  ',
        genero: 'Masculino',
        marca: 'Carolina Herrera',
        etiqueta: 'Nuevo',
    })

    assert.equal(
        resultado.where,
        'p.disponible = true and (p.nombre ilike $1 or p.marca ilike $2) and p.genero = $3 and p.marca = $4 and $5 = any(p.etiquetas)'
    )
    assert.deepEqual(resultado.valores, [
        "%212%' OR true --%",
        "%212%' OR true --%",
        'Masculino',
        'Carolina Herrera',
        'Nuevo',
    ])
})

test('la búsqueda vacía deja el catálogo visible sin parámetros extra', () => {
    assert.deepEqual(construirWhereCatalogo({ q: '  ' }), {
        where: 'p.disponible = true',
        valores: [],
    })
})

test('el límite de resultados se mantiene entre 1 y 48', () => {
    assert.equal(normalizarPorPagina(undefined), 12)
    assert.equal(normalizarPorPagina(0), 1)
    assert.equal(normalizarPorPagina(100), 48)
    assert.equal(normalizarPorPagina(6.9), 6)
})

test('la paginación limita la página y calcula desplazamientos consistentes', () => {
    assert.deepEqual(calcularPaginacion(8, 25, 12), {
        pagina: 3,
        totalPaginas: 3,
        offset: 24,
    })
    assert.deepEqual(calcularPaginacion(-2, 0, 12), {
        pagina: 1,
        totalPaginas: 1,
        offset: 0,
    })
})
