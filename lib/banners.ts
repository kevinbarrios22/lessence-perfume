import { getPool } from '@/lib/db'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function esIdBannerValido(id: string): boolean {
    return UUID_RE.test(id)
}

export type Banner = {
    id: string
    imagen: string
    texto_alt: string
    orden: number
    activo: boolean
}

export type BannerInput = {
    imagen: string
    texto_alt: string
    orden: number
    activo: boolean
}

const SELECT_BANNER = `
  id,
  imagen,
  texto_alt,
  orden,
  activo
`

function mapBanner(row: Banner): Banner {
    return {
        id: row.id,
        imagen: row.imagen,
        texto_alt: row.texto_alt,
        orden: Number(row.orden),
        activo: Boolean(row.activo),
    }
}

export async function listarBannersActivos(): Promise<Banner[]> {
    const { rows } = await getPool().query<Banner>(
        `select ${SELECT_BANNER}
         from public.banners
         where activo = true
         order by orden asc, created_at asc`
    )
    return rows.map(mapBanner)
}

export async function listarBannersAdmin(): Promise<Banner[]> {
    const { rows } = await getPool().query<Banner>(
        `select ${SELECT_BANNER}
         from public.banners
         order by orden asc, created_at asc`
    )
    return rows.map(mapBanner)
}

export async function obtenerBannerPorId(id: string): Promise<Banner | null> {
    if (!esIdBannerValido(id)) return null
    const { rows } = await getPool().query<Banner>(
        `select ${SELECT_BANNER} from public.banners where id = $1 limit 1`,
        [id]
    )
    return rows[0] ? mapBanner(rows[0]) : null
}

export async function crearBanner(input: BannerInput): Promise<string> {
    const { rows } = await getPool().query<{ id: string }>(
        `insert into public.banners (imagen, texto_alt, orden, activo)
         values ($1, $2, $3, $4)
         returning id`,
        [input.imagen, input.texto_alt, input.orden, input.activo]
    )
    return rows[0].id
}

export async function actualizarBanner(id: string, input: BannerInput): Promise<void> {
    if (!esIdBannerValido(id)) {
        throw new Error('ID de banner inválido')
    }
    await getPool().query(
        `update public.banners
         set imagen = $2, texto_alt = $3, orden = $4, activo = $5
         where id = $1`,
        [id, input.imagen, input.texto_alt, input.orden, input.activo]
    )
}

export async function actualizarActivoBanner(id: string, activo: boolean): Promise<void> {
    if (!esIdBannerValido(id)) return
    await getPool().query('update public.banners set activo = $2 where id = $1', [
        id,
        activo,
    ])
}

export async function eliminarBanner(id: string): Promise<void> {
    if (!esIdBannerValido(id)) return
    await getPool().query('delete from public.banners where id = $1', [id])
}

export async function imagenBannerEnUso(
    imagen: string,
    exceptoId?: string
): Promise<boolean> {
    const excepto = exceptoId && esIdBannerValido(exceptoId) ? exceptoId : null
    const { rows } = await getPool().query<{ existe: boolean }>(
        `
        select exists(
          select 1 from public.banners
          where imagen = $1
            and ($2::uuid is null or id <> $2::uuid)
        ) as existe
        `,
        [imagen, excepto]
    )
    return rows[0]?.existe ?? false
}
