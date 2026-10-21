export function limpiarSlug(slug: string): string {
    return slug
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function normalizarSlug(slug: string): string {
    return limpiarSlug(slug).replace(/-/g, '')
}
