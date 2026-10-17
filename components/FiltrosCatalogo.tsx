'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Combobox from '@/components/Combobox'
import { GENEROS } from '@/lib/opciones'

const chipBase =
    'px-3.5 py-1.5 rounded-full text-xs sm:text-sm border transition-colors whitespace-nowrap'
const etiquetaGrupo = 'text-cobre text-[11px] tracking-[0.2em] uppercase mr-1'

type Props = {
    marcas: string[]
    generos: string[]
    etiquetas: string[]
    total: number
}

export default function FiltrosCatalogo({ marcas, generos, etiquetas, total }: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const parametros = useSearchParams()

    const q = parametros.get('q') ?? ''
    const genero = parametros.get('genero') ?? ''
    const marca = parametros.get('marca') ?? ''
    const etiqueta = parametros.get('etiqueta') ?? ''

    const [texto, setTexto] = useState(q)
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        // Sincroniza el texto del buscador cuando cambia la URL (atrás/adelante).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTexto(q)
    }, [q])

    function aplicar(cambios: Record<string, string>) {
        const params = new URLSearchParams(parametros.toString())
        for (const [clave, valor] of Object.entries(cambios)) {
            if (valor) params.set(clave, valor)
            else params.delete(clave)
        }
        params.delete('pagina')
        const qs = params.toString()
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    }

    function cambiarTexto(valor: string) {
        setTexto(valor)
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => aplicar({ q: valor }), 350)
    }

    const orden = GENEROS as readonly string[]
    const generosOrdenados = [...generos].sort((a, b) => orden.indexOf(a) - orden.indexOf(b))

    const hayFiltros = Boolean(q || genero || marca || etiqueta)

    function chipClass(activo: boolean) {
        return `${chipBase} ${
            activo ? 'bg-humo text-porcelana border-humo' : 'border-alabastro text-humo hover:border-cobre'
        }`
    }

    return (
        <div className="mb-6 md:mb-8 space-y-4 max-w-2xl">
            <div className="relative">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-nude"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="search"
                    value={texto}
                    onChange={(e) => cambiarTexto(e.target.value)}
                    placeholder="Buscar por nombre o marca…"
                    aria-label="Buscar productos"
                    className="w-full rounded-sm border border-alabastro bg-white pl-10 pr-3 py-2.5 text-sm text-humo outline-none focus:border-cobre"
                />
            </div>

            {marcas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className={etiquetaGrupo}>Marca</span>
                    <Combobox
                        value={marca}
                        options={marcas}
                        onChange={(valor) => aplicar({ marca: valor })}
                        placeholder="Todas las marcas"
                        etiquetaTodos="Todas las marcas"
                        ariaLabel="Filtrar por marca"
                        className="w-full sm:w-64"
                    />
                </div>
            )}

            {generosOrdenados.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className={etiquetaGrupo}>Género</span>
                    <button
                        type="button"
                        onClick={() => aplicar({ genero: '' })}
                        aria-pressed={!genero}
                        className={chipClass(!genero)}
                    >
                        Todos
                    </button>
                    {generosOrdenados.map((g) => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => aplicar({ genero: g })}
                            aria-pressed={genero === g}
                            className={chipClass(genero === g)}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}

            {etiquetas.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className={etiquetaGrupo}>Etiqueta</span>
                    <button
                        type="button"
                        onClick={() => aplicar({ etiqueta: '' })}
                        aria-pressed={!etiqueta}
                        className={chipClass(!etiqueta)}
                    >
                        Todas
                    </button>
                    {etiquetas.map((valorEtiqueta) => (
                        <button
                            key={valorEtiqueta}
                            type="button"
                            onClick={() => aplicar({ etiqueta: valorEtiqueta })}
                            aria-pressed={etiqueta === valorEtiqueta}
                            className={chipClass(etiqueta === valorEtiqueta)}
                        >
                            {valorEtiqueta}
                        </button>
                    ))}
                </div>
            )}

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
