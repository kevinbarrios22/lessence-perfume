const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_VARIANTES = 100

export function normalizarIdsVariante(valor: unknown): string[] | null {
    if (!Array.isArray(valor)) return null
    return [
        ...new Set(
            valor
                .filter((id): id is string => typeof id === 'string' && UUID_RE.test(id))
                .slice(0, MAX_VARIANTES)
        ),
    ]
}
