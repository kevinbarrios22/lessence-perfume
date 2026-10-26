'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const base = 'px-3 py-1.5 rounded-full text-sm transition-colors whitespace-nowrap'

export default function AdminNav() {
    const pathname = usePathname()

    const esNuevo = pathname === '/admin/productos/nuevo'
    const esLista = pathname.startsWith('/admin/productos') && !esNuevo
    const esBanners = pathname.startsWith('/admin/banners')

    const enlaces = [
        { href: '/admin/productos', label: 'Productos', activo: esLista },
        { href: '/admin/productos/nuevo', label: 'Nuevo producto', activo: esNuevo },
        { href: '/admin/banners', label: 'Banners', activo: esBanners },
    ]

    return (
        <nav className="flex items-center gap-1">
            {enlaces.map((enlace) => (
                <Link
                    key={enlace.href}
                    href={enlace.href}
                    aria-current={enlace.activo ? 'page' : undefined}
                    className={`${base} ${
                        enlace.activo
                            ? 'bg-humo text-porcelana'
                            : 'text-nude hover:text-cobre'
                    }`}
                >
                    {enlace.label}
                </Link>
            ))}
        </nav>
    )
}
