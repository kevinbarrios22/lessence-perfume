export const GENEROS = ['Unisex', 'Masculino', 'Femenino'] as const

export type Genero = (typeof GENEROS)[number]

export function esGeneroValido(valor: string): boolean {
    return (GENEROS as readonly string[]).includes(valor)
}

export const TAMANOS = [
    '30ml',
    '50ml',
    '75ml',
    '100ml',
    '125ml',
    '150ml',
    '200ml',
] as const

export type Tamano = (typeof TAMANOS)[number]

export function esTamanoEstandar(valor: string): boolean {
    return (TAMANOS as readonly string[]).includes(valor)
}

