import type { PoolClient } from 'pg'
import { getPool } from '@/lib/db'
import { limpiarSlug } from '@/lib/slug'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function esIdProductoValido(id: string): boolean {
    return UUID_RE.test(id)
}

export type Variante = {
    id: string
    tamaño: string
    precio: number
    disponible: boolean
}

export type Producto = {
    id: string
    nombre: string
    marca: string
    slug: string
    descripcion: string
    genero: string
    tipo: string
    imagen_principal: string | null
    disponible: boolean
    etiquetas: string[]
    variantes: Variante[]
    notas_salida?: string | null
    notas_corazon?: string | null
    notas_fondo?: string | null
}

type ProductoRow = Omit<Producto, 'variantes'> & {
    variantes: Variante[] | null
}

function mapVariantes(raw: unknown): Variante[] {
    if (!Array.isArray(raw)) return []
    return raw.map((v) => ({
        id: String(v.id),
        tamaño: String(v.tamaño),
        precio: Number(v.precio),
        disponible: Boolean(v.disponible),
    }))
}

function mapProducto(row: ProductoRow): Producto {
    return {
        ...row,
        imagen_principal: row.imagen_principal ?? null,
        etiquetas: Array.isArray(row.etiquetas) ? row.etiquetas : [],
        variantes: mapVariantes(row.variantes),
    }
}

const SELECT_PRODUCTO = `
  p.id,
  p.nombre,
  p.marca,
  p.slug,
  p.descripcion,
  p.genero,
  p.tipo,
  p.imagen_principal,
  p.disponible,
  p.etiquetas,
  p.notas_salida,
  p.notas_corazon,
  p.notas_fondo,
  coalesce(
    json_agg(
      json_build_object(
        'id', v.id,
        'tamaño', v.tamaño,
        'precio', v.precio,
        'disponible', v.disponible
      )
      order by v.tamaño
    ) filter (where v.id is not null),
    '[]'::json
  ) as variantes
`

export type FiltrosCatalogo = {
    q?: string
    genero?: string
    marca?: string
    etiqueta?: string
    pagina?: number
    porPagina?: number
}

export type ResultadoCatalogo = {
    productos: Producto[]
    total: number
    pagina: number
    totalPaginas: number
}

export type OpcionesFiltro = {
    marcas: string[]
    generos: string[]
    etiquetas: string[]
}

const POR_PAGINA_DEFECTO = 12
const POR_PAGINA_MAX = 48

export async function buscarProductos(filtros: FiltrosCatalogo): Promise<ResultadoCatalogo> {
    const porPagina = Math.min(
        Math.max(Math.trunc(filtros.porPagina ?? POR_PAGINA_DEFECTO), 1),
        POR_PAGINA_MAX
    )
    const pool = getPool()

    const condiciones = ['p.disponible = true']
    const valores: unknown[] = []
    const param = (valor: unknown) => {
        valores.push(valor)
        return `$${valores.length}`
    }

    const q = filtros.q?.trim()
    if (q) {
        const patron = `%${q}%`
        condiciones.push(`(p.nombre ilike ${param(patron)} or p.marca ilike ${param(patron)})`)
    }
    if (filtros.genero) condiciones.push(`p.genero = ${param(filtros.genero)}`)
    if (filtros.marca) condiciones.push(`p.marca = ${param(filtros.marca)}`)
    if (filtros.etiqueta) condiciones.push(`${param(filtros.etiqueta)} = any(p.etiquetas)`)

    const where = condiciones.join(' and ')

    const totalRes = await pool.query<{ total: number }>(
        `select count(*)::int as total from productos p where ${where}`,
        valores
    )
    const total = totalRes.rows[0]?.total ?? 0
    const totalPaginas = Math.max(Math.ceil(total / porPagina), 1)
    const pagina = Math.min(Math.max(Math.trunc(filtros.pagina ?? 1), 1), totalPaginas)
    const offset = (pagina - 1) * porPagina

    const { rows } = await pool.query<ProductoRow>(
        `
    select ${SELECT_PRODUCTO}
    from productos p
    left join variantes v on v.producto_id = p.id
    where ${where}
    group by p.id
    order by p.nombre asc
    limit ${param(porPagina)} offset ${param(offset)}
  `,
        valores
    )

    return { productos: rows.map(mapProducto), total, pagina, totalPaginas }
}

export async function listarOpcionesFiltro(): Promise<OpcionesFiltro> {
    const pool = getPool()
    const { rows } = await pool.query<{
        marcas: string[] | null
        generos: string[] | null
        etiquetas: string[] | null
    }>(`
    select
      (
        select array_agg(m order by m)
        from (select distinct marca as m from productos where disponible = true and coalesce(marca, '') <> '') s
      ) as marcas,
      (
        select array_agg(g order by g)
        from (select distinct genero as g from productos where disponible = true and coalesce(genero, '') <> '') s
      ) as generos,
      (
        select array_agg(distinct e order by e)
        from productos p, unnest(p.etiquetas) e
        where p.disponible = true
      ) as etiquetas
  `)
    const fila = rows[0]
    return {
        marcas: fila?.marcas ?? [],
        generos: fila?.generos ?? [],
        etiquetas: fila?.etiquetas ?? [],
    }
}

export async function listarSlugsDisponibles(): Promise<string[]> {
    const pool = getPool()
    const { rows } = await pool.query<{ slug: string }>(
        `select slug from productos where disponible = true order by slug`
    )
    return rows.map((r) => limpiarSlug(r.slug))
}

export async function obtenerProductoPorSlug(slug: string): Promise<Producto | null> {
    const slugLimpio = limpiarSlug(slug)
    if (!slugLimpio) return null

    const pool = getPool()
    const { rows } = await pool.query<ProductoRow>(
        `
    select ${SELECT_PRODUCTO}
    from productos p
    left join variantes v on v.producto_id = p.id
    where p.disponible = true and p.slug = $1
    group by p.id
    limit 1
  `,
        [slugLimpio]
    )

    return rows[0] ? mapProducto(rows[0]) : null
}

export type VarianteInput = {
    tamaño: string
    precio: number
    disponible: boolean
}

export type ProductoInput = {
    nombre: string
    marca: string
    slug: string
    descripcion: string
    genero: string
    tipo: string
    imagen_principal: string | null
    disponible: boolean
    etiquetas: string[]
    notas_salida: string | null
    notas_corazon: string | null
    notas_fondo: string | null
    variantes: VarianteInput[]
}

export type EstadoProducto = 'todos' | 'visible' | 'oculto'

export type FiltrosProductosAdmin = {
    q?: string
    estado?: EstadoProducto
    pagina?: number
    porPagina?: number
}

const POR_PAGINA_ADMIN_DEFECTO = 20

export async function listarProductosAdmin(
    filtros: FiltrosProductosAdmin = {}
): Promise<ResultadoCatalogo> {
    const porPagina = Math.min(
        Math.max(Math.trunc(filtros.porPagina ?? POR_PAGINA_ADMIN_DEFECTO), 1),
        100
    )
    const pool = getPool()
    const condiciones: string[] = []
    const valores: unknown[] = []
    const param = (valor: unknown) => {
        valores.push(valor)
        return `$${valores.length}`
    }

    const q = filtros.q?.trim()
    if (q) {
        const patron = `%${q}%`
        condiciones.push(`(p.nombre ilike ${param(patron)} or p.marca ilike ${param(patron)})`)
    }
    if (filtros.estado === 'visible') condiciones.push('p.disponible = true')
    else if (filtros.estado === 'oculto') condiciones.push('p.disponible = false')

    const where = condiciones.length ? `where ${condiciones.join(' and ')}` : ''

    const totalRes = await pool.query<{ total: number }>(
        `select count(*)::int as total from productos p ${where}`,
        valores
    )
    const total = totalRes.rows[0]?.total ?? 0
    const totalPaginas = Math.max(Math.ceil(total / porPagina), 1)
    const pagina = Math.min(Math.max(Math.trunc(filtros.pagina ?? 1), 1), totalPaginas)
    const offset = (pagina - 1) * porPagina

    const { rows } = await pool.query<ProductoRow>(
        `
    select ${SELECT_PRODUCTO}
    from productos p
    left join variantes v on v.producto_id = p.id
    ${where}
    group by p.id
    order by p.created_at desc
    limit ${param(porPagina)} offset ${param(offset)}
  `,
        valores
    )

    return { productos: rows.map(mapProducto), total, pagina, totalPaginas }
}

export async function obtenerProductoPorId(id: string): Promise<Producto | null> {
    if (!esIdProductoValido(id)) return null
    const pool = getPool()
    const { rows } = await pool.query<ProductoRow>(
        `
    select ${SELECT_PRODUCTO}
    from productos p
    left join variantes v on v.producto_id = p.id
    where p.id = $1
    group by p.id
    limit 1
  `,
        [id]
    )
    return rows[0] ? mapProducto(rows[0]) : null
}

export async function crearProducto(input: ProductoInput): Promise<string> {
    const pool = getPool()
    const client = await pool.connect()
    try {
        await client.query('begin')
        const { rows } = await client.query<{ id: string }>(
            `
      insert into productos
        (nombre, marca, slug, descripcion, genero, tipo, imagen_principal,
         disponible, etiquetas, notas_salida, notas_corazon, notas_fondo)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      returning id
    `,
            [
                input.nombre,
                input.marca,
                input.slug,
                input.descripcion,
                input.genero,
                input.tipo,
                input.imagen_principal,
                input.disponible,
                input.etiquetas,
                input.notas_salida,
                input.notas_corazon,
                input.notas_fondo,
            ]
        )
        const id = rows[0].id
        await insertarVariantes(client, id, input.variantes)
        await client.query('commit')
        return id
    } catch (error) {
        await client.query('rollback')
        throw error
    } finally {
        client.release()
    }
}

export async function actualizarProducto(id: string, input: ProductoInput): Promise<void> {
    if (!esIdProductoValido(id)) {
        throw new Error('ID de producto inválido')
    }
    const pool = getPool()
    const client = await pool.connect()
    try {
        await client.query('begin')
        await client.query(
            `
      update productos set
        nombre = $2, marca = $3, slug = $4, descripcion = $5, genero = $6,
        tipo = $7, imagen_principal = $8, disponible = $9, etiquetas = $10,
        notas_salida = $11, notas_corazon = $12, notas_fondo = $13
      where id = $1
    `,
            [
                id,
                input.nombre,
                input.marca,
                input.slug,
                input.descripcion,
                input.genero,
                input.tipo,
                input.imagen_principal,
                input.disponible,
                input.etiquetas,
                input.notas_salida,
                input.notas_corazon,
                input.notas_fondo,
            ]
        )
        await client.query('delete from variantes where producto_id = $1', [id])
        await insertarVariantes(client, id, input.variantes)
        await client.query('commit')
    } catch (error) {
        await client.query('rollback')
        throw error
    } finally {
        client.release()
    }
}

export async function eliminarProducto(id: string): Promise<void> {
    if (!esIdProductoValido(id)) return
    const pool = getPool()
    await pool.query('delete from productos where id = $1', [id])
}

export async function imagenEnUso(imagen: string, exceptoId?: string): Promise<boolean> {
    const pool = getPool()
    const excepto = exceptoId && esIdProductoValido(exceptoId) ? exceptoId : null
    const { rows } = await pool.query<{ existe: boolean }>(
        `
        select exists(
          select 1 from productos
          where imagen_principal = $1
            and ($2::uuid is null or id <> $2::uuid)
        ) as existe
        `,
        [imagen, excepto]
    )
    return rows[0]?.existe ?? false
}

async function insertarVariantes(
    client: PoolClient,
    productoId: string,
    variantes: VarianteInput[]
): Promise<void> {
    for (const v of variantes) {
        await client.query(
            `insert into variantes (producto_id, tamaño, precio, disponible)
             values ($1, $2, $3, $4)`,
            [productoId, v.tamaño, v.precio, v.disponible]
        )
    }
}
