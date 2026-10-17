'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { COOKIE_SESION, crearToken, verificarPassword, OPCIONES_COOKIE } from '@/lib/auth'

export type EstadoLogin = { error?: string }

export async function iniciarSesion(
    _prev: EstadoLogin,
    formData: FormData
): Promise<EstadoLogin> {
    const password = String(formData.get('password') ?? '')

    if (!verificarPassword(password)) {
        return { error: 'Contraseña incorrecta' }
    }

    const store = await cookies()
    store.set(COOKIE_SESION, crearToken(), OPCIONES_COOKIE)
    redirect('/admin/productos')
}

export async function cerrarSesion(): Promise<void> {
    const store = await cookies()
    store.delete(COOKIE_SESION)
    redirect('/admin/login')
}
