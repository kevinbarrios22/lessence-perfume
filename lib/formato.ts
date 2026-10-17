import { LOCALE, MONEDA } from '@/lib/config'

const formateador = new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: MONEDA,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})

export function formatearPrecio(n: number): string {
    if (!Number.isFinite(n)) return formateador.format(0)
    return formateador.format(n)
}
