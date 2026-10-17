import 'server-only'
import { cookies } from 'next/headers'
import { COOKIE_SESION, tokenValido } from '@/lib/auth'

export async function sesionActiva(): Promise<boolean> {
    const store = await cookies()
    return tokenValido(store.get(COOKIE_SESION)?.value)
}
