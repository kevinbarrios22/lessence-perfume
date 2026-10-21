import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_VARIANTES = 100

type FilaVariante = {
    variante_id: string
    producto_id: string
    slug: string
    nombre: string
    marca: string
    imagen: string | null
    tamaño: string
    precio: number
    disponible: boolean
}

export async function POST(request: Request) {
    let cuerpo: unknown
    try {
        cuerpo = await request.json()
    } catch {
        return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const crudos = (cuerpo as { varianteIds?: unknown } | null)?.varianteIds
    if (!Array.isArray(crudos)) {
        return NextResponse.json({ error: 'varianteIds es obligatorio' }, { status: 400 })
    }

    const ids = [
        ...new Set(
            crudos
                .filter((id): id is string => typeof id === 'string' && UUID_RE.test(id))
                .slice(0, MAX_VARIANTES)
        ),
    ]

    if (ids.length === 0) {
        return NextResponse.json({ items: [] })
    }

    try {
        const { rows } = await getPool().query<FilaVariante>(
            `
            select
              v.id as variante_id,
              p.id as producto_id,
              p.slug,
              p.nombre,
              p.marca,
              p.imagen_principal as imagen,
              v.tamaño,
              v.precio::float8 as precio,
              (v.disponible and p.disponible) as disponible
            from variantes v
            join productos p on p.id = v.producto_id
            where v.id = any($1::uuid[])
        `,
            [ids]
        )

        return NextResponse.json(
            {
                items: rows.map((fila) => ({
                    varianteId: fila.variante_id,
                    productoId: fila.producto_id,
                    slug: fila.slug,
                    nombre: fila.nombre,
                    marca: fila.marca,
                    imagen: fila.imagen,
                    tamaño: fila.tamaño,
                    precio: Number(fila.precio),
                    disponible: fila.disponible,
                })),
            },
            { headers: { 'cache-control': 'no-store' } }
        )
    } catch {
        return NextResponse.json(
            { error: 'No se pudo verificar el carrito' },
            { status: 500 }
        )
    }
}
