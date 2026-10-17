export function limpiarSlug(slug: string): string {
    return slug.trim().replace(/\s+/g, '-').toLowerCase()
}

export function normalizarSlug(slug: string): string {
    return slug.toLowerCase().replace(/[^a-z0-9]+/g, '')
}