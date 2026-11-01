export type FiltrosCatalogoConsulta = {
    q?: string
    genero?: string
    marca?: string
    etiqueta?: string
}

export function construirWhereCatalogo(filtros: FiltrosCatalogoConsulta): {
    where: string
    valores: unknown[]
} {
    const condiciones = ['p.disponible = true']
    const valores: unknown[] = []
    const parametro = (valor: unknown) => {
        valores.push(valor)
        return `$${valores.length}`
    }

    const q = filtros.q?.trim()
    if (q) {
        const patron = `%${q}%`
        condiciones.push(
            `(p.nombre ilike ${parametro(patron)} or p.marca ilike ${parametro(patron)})`
        )
    }
    if (filtros.genero) condiciones.push(`p.genero = ${parametro(filtros.genero)}`)
    if (filtros.marca) condiciones.push(`p.marca = ${parametro(filtros.marca)}`)
    if (filtros.etiqueta) condiciones.push(`${parametro(filtros.etiqueta)} = any(p.etiquetas)`)

    return { where: condiciones.join(' and '), valores }
}

export function normalizarPorPagina(valor: number | undefined, defecto = 12, maximo = 48): number {
    return Math.min(Math.max(Math.trunc(valor ?? defecto), 1), maximo)
}

export function calcularPaginacion(
    paginaSolicitada: number | undefined,
    total: number,
    porPagina: number
): { pagina: number; totalPaginas: number; offset: number } {
    const totalPaginas = Math.max(Math.ceil(total / porPagina), 1)
    const pagina = Math.min(Math.max(Math.trunc(paginaSolicitada ?? 1), 1), totalPaginas)
    return { pagina, totalPaginas, offset: (pagina - 1) * porPagina }
}
