export const GENEROS = ['Unisex', 'Masculino', 'Femenino'] as const

export type Genero = (typeof GENEROS)[number]

export function esGeneroValido(valor: string): boolean {
    return (GENEROS as readonly string[]).includes(valor)
}
