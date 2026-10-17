import { createHmac, timingSafeEqual, createHash } from 'crypto'

export const COOKIE_SESION = 'parfumerie_admin'
const DURACION_SEGUNDOS = 60 * 60 * 24 * 7

function secreto(): string {
    const valor = process.env.ADMIN_SECRET
    if (!valor) {
        throw new Error('Falta ADMIN_SECRET en las variables de entorno')
    }
    return valor
}

function base64url(input: Buffer | string): string {
    return Buffer.from(input)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

function firmar(payload: string): string {
    return base64url(createHmac('sha256', secreto()).update(payload).digest())
}

function compararSeguro(a: string, b: string): boolean {
    const bufferA = Buffer.from(a)
    const bufferB = Buffer.from(b)
    if (bufferA.length !== bufferB.length) return false
    return timingSafeEqual(bufferA, bufferB)
}

export function verificarPassword(intento: string): boolean {
    const esperado = process.env.ADMIN_PASSWORD
    if (!esperado) {
        throw new Error('Falta ADMIN_PASSWORD en las variables de entorno')
    }
    const hashIntento = createHash('sha256').update(intento).digest('hex')
    const hashEsperado = createHash('sha256').update(esperado).digest('hex')
    return compararSeguro(hashIntento, hashEsperado)
}

export function crearToken(): string {
    const payload = base64url(
        JSON.stringify({ exp: Date.now() + DURACION_SEGUNDOS * 1000 })
    )
    return `${payload}.${firmar(payload)}`
}

export function tokenValido(token: string | undefined | null): boolean {
    if (!token) return false
    const partes = token.split('.')
    if (partes.length !== 2) return false
    const [payload, firma] = partes
    if (!compararSeguro(firma, firmar(payload))) return false
    try {
        const datos = JSON.parse(
            Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        )
        return typeof datos.exp === 'number' && datos.exp > Date.now()
    } catch {
        return false
    }
}

export const OPCIONES_COOKIE = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DURACION_SEGUNDOS,
    secure: process.env.NODE_ENV === 'production',
}
