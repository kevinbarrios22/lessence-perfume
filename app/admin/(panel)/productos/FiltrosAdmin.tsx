'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type Estado = 'todos' | 'visible' | 'oculto'

const ESTADOS: { valor: Estado; etiqueta: string }[] = [
    { valor: 'todos', etiqueta: 'Todos' },
    { valor: 'visible', etiqueta: 'Visible' },
    { valor: 'oculto', etiqueta: 'Oculto' },
]

const chipBase = 'px-3 py-1.5 rounded-full text-xs border transition-colors'

function normalizarEstado(valor: string | null): Estado {
    return valor === 'visible' || valor === 'oculto' ? valor : 'todos'
}

export default function FiltrosAdmin({ total }: { total: number }) {
    const router = useRouter()
    const pathname = usePathname()
    const parametros = useSearchParams()

    const q = parametros.get('q') ?? ''
    const estado = normalizarEstado(parametros.get('estado'))

    const [texto, setTexto] = useState(q)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        // Sincroniza el texto del buscador cuando cambia la URL (atrás/adelante).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTexto(q)
    }, [q])

    useEffect(() => {
        return () => {
            if (timer.current) clearTimeout(timer.current)
        }
    }, [])

    function aplicar(cambios: { q?: string; estado?: Estado }) {
        const params = new URLSearchParams(parametros.toString())
        const nuevoQ = (cambios.q ?? texto).trim()
        const nuevoEstado = cambios.estado ?? estado

        if (nuevoQ) params.set('q', nuevoQ)
        else params.delete('q')
        if (nuevoEstado !== 'todos') params.set('estado', nuevoEstado)
        else params.delete('estado')

        params.delete('pagina')
        params.delete('ok')

        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }

    function cambiarTexto(valor: string) {
        setTexto(valor)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => aplicar({ q: valor }), 350)
    }

    const hayFiltros = Boolean(q) || estado !== 'todos'

    function chipClass(activo: boolean) {
        return `${chipBase} ${
            activo ? 'bg-humo text-porcelana border-humo' : 'border-alabastro text-humo hover:border-cobre'
        }`
    }

    return (
        <div className="mb-5 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <input
                    type="search"
                    value={texto}
                    onChange={(e) => cambiarTexto(e.target.value)}
                    placeholder="Buscar por nombre o marca…"
                    aria-label="Buscar productos"
                    className="w-full rounded-sm border border-alabastro bg-white px-3 py-2 text-sm text-humo outline-none focus:border-cobre sm:max-w-xs"
                />
                <div className="flex items-center gap-1.5">
                    {ESTADOS.map((e) => (
                        <button
                            key={e.valor}
                            type="button"
                            onClick={() => aplicar({ estado: e.valor })}
                            aria-pressed={estado === e.valor}
                            className={chipClass(estado === e.valor)}
                        >
                            {e.etiqueta}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-nude">
                <span>
                    {total} {total === 1 ? 'producto' : 'productos'}
                </span>
                {hayFiltros && (
                    <button
                        type="button"
                        onClick={() => {
                            setTexto('')
                            router.push(pathname, { scroll: false })
                        }}
                        className="underline hover:text-cobre"
                    >
                        Limpiar filtros
                    </button>
                )}
            </div>
        </div>
    )
}
