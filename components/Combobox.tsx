'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

type Props = {
    value: string
    options: string[]
    onChange: (value: string) => void
    placeholder?: string
    etiquetaTodos?: string
    className?: string
    ariaLabel?: string
}

export default function Combobox({
    value,
    options,
    onChange,
    placeholder = 'Buscar…',
    etiquetaTodos = 'Todas',
    className = '',
    ariaLabel,
}: Props) {
    const [abierto, setAbierto] = useState(false)
    const [consulta, setConsulta] = useState('')
    const [activo, setActivo] = useState(0)
    const contenedor = useRef<HTMLDivElement>(null)
    const listaId = useId()

    const listaCompleta = useMemo(() => [etiquetaTodos, ...options], [etiquetaTodos, options])

    const filtradas = useMemo(() => {
        const t = consulta.trim().toLowerCase()
        if (!t) return listaCompleta
        return listaCompleta.filter((o) => o.toLowerCase().includes(t))
    }, [consulta, listaCompleta])

    useEffect(() => {
        function alClicFuera(e: MouseEvent) {
            if (contenedor.current && !contenedor.current.contains(e.target as Node)) {
                setAbierto(false)
                setConsulta('')
            }
        }
        document.addEventListener('mousedown', alClicFuera)
        return () => document.removeEventListener('mousedown', alClicFuera)
    }, [])

    function seleccionar(opcion: string) {
        onChange(opcion === etiquetaTodos ? '' : opcion)
        setAbierto(false)
        setConsulta('')
    }

    function alTeclear(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setAbierto(true)
            setActivo((a) => Math.min(a + 1, filtradas.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActivo((a) => Math.max(a - 1, 0))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (abierto && filtradas[activo]) seleccionar(filtradas[activo])
        } else if (e.key === 'Escape') {
            setAbierto(false)
            setConsulta('')
        }
    }

    const texto = abierto ? consulta : value

    return (
        <div ref={contenedor} className={`relative ${className}`}>
            <svg
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-nude"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="m6 9 6 6 6-6" />
            </svg>
            <input
                type="text"
                role="combobox"
                aria-expanded={abierto}
                aria-controls={listaId}
                aria-autocomplete="list"
                aria-label={ariaLabel}
                autoComplete="off"
                value={texto}
                placeholder={placeholder}
                onChange={(e) => {
                    setConsulta(e.target.value)
                    setAbierto(true)
                    setActivo(0)
                }}
                onFocus={() => setAbierto(true)}
                onKeyDown={alTeclear}
                className="w-full rounded-sm border border-alabastro bg-white pl-9 pr-3 py-2 text-sm text-humo outline-none focus:border-cobre"
            />
            {abierto && (
                <ul
                    id={listaId}
                    role="listbox"
                    className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-sm border border-alabastro bg-white py-1 shadow-lg"
                >
                    {filtradas.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-nude">Sin resultados</li>
                    ) : (
                        filtradas.map((opcion, i) => {
                            const seleccionada = opcion === etiquetaTodos ? value === '' : opcion === value
                            return (
                                <li
                                    key={opcion}
                                    role="option"
                                    aria-selected={seleccionada}
                                    onMouseDown={(e) => {
                                        e.preventDefault()
                                        seleccionar(opcion)
                                    }}
                                    onMouseEnter={() => setActivo(i)}
                                    className={`cursor-pointer px-3 py-2 text-sm ${
                                        i === activo ? 'bg-porcelana' : ''
                                    } ${seleccionada ? 'font-medium text-cobre' : 'text-humo'}`}
                                >
                                    {opcion}
                                </li>
                            )
                        })
                    )}
                </ul>
            )}
        </div>
    )
}
