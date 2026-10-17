export const ETIQUETAS_DISPONIBLES: string[] = ['Nuevo', 'Más vendido']

const ESTILOS: Record<string, string> = {
    Nuevo: 'bg-cobre text-porcelana',
    'Más vendido': 'bg-humo/90 text-porcelana',
}

export function esEtiquetaValida(valor: string): boolean {
    return ETIQUETAS_DISPONIBLES.includes(valor)
}

export function claseEtiqueta(valor: string): string {
    return ESTILOS[valor] ?? 'bg-humo/90 text-porcelana'
}
