import Link from 'next/link'

type Props = {
    pagina: number
    totalPaginas: number
    queryBase: string
    basePath?: string
    ancla?: string
}

function rangoPaginas(actual: number, total: number): (number | '...')[] {
    const paginas: (number | '...')[] = []
    for (let n = 1; n <= total; n++) {
        if (n === 1 || n === total || Math.abs(n - actual) <= 1) {
            paginas.push(n)
        } else if (paginas[paginas.length - 1] !== '...') {
            paginas.push('...')
        }
    }
    return paginas
}

function hrefPagina(basePath: string, queryBase: string, ancla: string, pagina: number): string {
    const params = new URLSearchParams(queryBase)
    if (pagina > 1) params.set('pagina', String(pagina))
    else params.delete('pagina')
    const qs = params.toString()
    return `${basePath}${qs ? `?${qs}` : ''}${ancla}`
}

const botonBase =
    'inline-flex min-w-[2.5rem] items-center justify-center rounded-sm border px-3 py-2 text-sm transition-colors'

export default function Paginacion({
    pagina,
    totalPaginas,
    queryBase,
    basePath = '/',
    ancla = '#catalogo',
}: Props) {
    if (totalPaginas <= 1) return null

    const paginas = rangoPaginas(pagina, totalPaginas)
    const anterior = Math.max(pagina - 1, 1)
    const siguiente = Math.min(pagina + 1, totalPaginas)

    return (
        <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación">
            <Link
                href={hrefPagina(basePath, queryBase, ancla, anterior)}
                aria-disabled={pagina <= 1}
                scroll={false}
                className={`${botonBase} ${
                    pagina <= 1
                        ? 'pointer-events-none border-alabastro text-alabastro'
                        : 'border-alabastro text-humo hover:border-cobre'
                }`}
            >
                Anterior
            </Link>

            {paginas.map((n, i) =>
                n === '...' ? (
                    <span key={`puntos-${i}`} className="px-1 text-nude" aria-hidden="true">
                        …
                    </span>
                ) : (
                    <Link
                        key={n}
                        href={hrefPagina(basePath, queryBase, ancla, n)}
                        aria-current={n === pagina ? 'page' : undefined}
                        scroll={false}
                        className={`${botonBase} ${
                            n === pagina
                                ? 'border-humo bg-humo text-porcelana'
                                : 'border-alabastro text-humo hover:border-cobre'
                        }`}
                    >
                        {n}
                    </Link>
                )
            )}

            <Link
                href={hrefPagina(basePath, queryBase, ancla, siguiente)}
                aria-disabled={pagina >= totalPaginas}
                scroll={false}
                className={`${botonBase} ${
                    pagina >= totalPaginas
                        ? 'pointer-events-none border-alabastro text-alabastro'
                        : 'border-alabastro text-humo hover:border-cobre'
                }`}
            >
                Siguiente
            </Link>
        </nav>
    )
}
