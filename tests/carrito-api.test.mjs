import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizarIdsVariante } from '../lib/carrito-api.ts'

const uuidA = '11111111-1111-4111-8111-111111111111'
const uuidB = '22222222-2222-4222-8222-222222222222'

test('la verificación requiere una lista y devuelve vacío cuando no hay UUID válido', () => {
    assert.equal(normalizarIdsVariante(undefined), null)
    assert.equal(normalizarIdsVariante('no es una lista'), null)
    assert.deepEqual(normalizarIdsVariante([null, 12, 'no-uuid']), [])
})

test('la verificación conserva UUID válidos en orden y elimina duplicados e inválidos', () => {
    assert.deepEqual(normalizarIdsVariante([uuidA, 'no-uuid', uuidB, uuidA]), [uuidA, uuidB])
})

test('la verificación limita la carga a 100 variantes', () => {
    const ids = Array.from({ length: 101 }, (_, i) =>
        `${String(i + 1).padStart(8, '0')}-1111-4111-8111-111111111111`
    )
    assert.equal(normalizarIdsVariante(ids).length, 100)
})
