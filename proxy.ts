import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { COOKIE_SESION, tokenValido } from '@/lib/auth'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const autorizado = tokenValido(request.cookies.get(COOKIE_SESION)?.value)

    if (pathname === '/admin/login') {
        if (autorizado) {
            return NextResponse.redirect(new URL('/admin/productos', request.url))
        }
        return NextResponse.next()
    }

    if (!autorizado) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*'],
}
