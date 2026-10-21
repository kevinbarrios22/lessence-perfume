'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sesionActiva } from '@/lib/sesion'
import { crearUrlSubida, eliminarImagenR2, r2Configurado } from '@/lib/r2'
import { limpiarSlug } from '@/lib/slug'
import {
    actualizarProducto,
    crearProducto,
    eliminarProducto,
    imagenEnUso,
    obtenerProductoPorId,
    type ProductoInput,
    type VarianteInput,
} from '@/lib/productos'
import { esEtiquetaValida } from '@/lib/etiquetas'
import { esGeneroValido } from '@/lib/opciones'
import {
    formatearMB,
    MAX_IMAGEN_BYTES,
    TIPOS_IMAGEN_PERMITIDOS,
} from '@/lib/imagen'

export type EstadoProducto = { error?: string }

// Los precios se manejan en pesos colombianos, sin centavos.
const PRECIO_MINIMO_COP = 1000

function texto(formData: FormData, campo: string): string {
    return String(formData.get(campo) ?? '').trim()
}

function textoONulo(formData: FormData, campo: string): string | null {
    const valor = texto(formData, campo)
    return valor === '' ? null : valor
}

function parsearVariantes(raw: string): VarianteInput[] {
    let datos: unknown
    try {
        datos = JSON.parse(raw)
    } catch {
        throw new Error('Las variantes no tienen un formato válido')
    }
    if (!Array.isArray(datos)) {
        throw new Error('Las variantes no tienen un formato válido')
    }
    const variantes: VarianteInput[] = []
    const vistos = new Set<string>()
    for (const item of datos) {
        if (typeof item !== 'object' || item === null) {
            throw new Error('Las variantes tienen datos inválidos.')
        }
        const tamaño = String((item as Record<string, unknown>).tamaño ?? '').trim()
        const precio = Number((item as Record<string, unknown>).precio)
        if (!tamaño) {
            throw new Error('Completá el tamaño de cada variante o quitá las filas vacías.')
        }
        if (vistos.has(tamaño)) {
            throw new Error(
                `El tamaño "${tamaño}" está repetido. Cada tamaño debe aparecer una sola vez.`
            )
        }
        if (!Number.isInteger(precio) || precio < PRECIO_MINIMO_COP) {
            throw new Error(
                `El precio de "${tamaño}" debe estar en pesos colombianos, sin puntos ni centavos (ej: 84900).`
            )
        }
        vistos.add(tamaño)
        variantes.push({
            tamaño,
            precio,
            disponible: Boolean((item as Record<string, unknown>).disponible),
        })
    }
    if (variantes.length === 0) {
        throw new Error('Agregá al menos un tamaño con su precio.')
    }
    return variantes
}

function leerEntrada(formData: FormData): ProductoInput {
    const nombre = texto(formData, 'nombre')
    if (!nombre) {
        throw new Error('El nombre es obligatorio')
    }

    const slugBase = textoONulo(formData, 'slug') ?? nombre
    const slug = limpiarSlug(slugBase)
    if (!slug) {
        throw new Error('El slug es obligatorio')
    }

    const genero = texto(formData, 'genero')
    if (!esGeneroValido(genero)) {
        throw new Error('Seleccioná un género válido (Unisex, Masculino o Femenino).')
    }

    return {
        nombre,
        marca: texto(formData, 'marca'),
        slug,
        descripcion: texto(formData, 'descripcion'),
        genero,
        tipo: texto(formData, 'tipo'),
        imagen_principal: textoONulo(formData, 'imagen_principal'),
        disponible: formData.get('disponible') === 'on',
        etiquetas: formData
            .getAll('etiquetas')
            .map((valor) => String(valor))
            .filter((valor) => esEtiquetaValida(valor)),
        notas_salida: textoONulo(formData, 'notas_salida'),
        notas_corazon: textoONulo(formData, 'notas_corazon'),
        notas_fondo: textoONulo(formData, 'notas_fondo'),
        variantes: parsearVariantes(String(formData.get('variantes') ?? '[]')),
    }
}

function revalidarCatalogo(slug: string, slugAnterior?: string | null) {
    revalidatePath('/admin/productos')
    revalidatePath(`/producto/${slug}`)
    if (slugAnterior && slugAnterior !== slug) {
        revalidatePath(`/producto/${slugAnterior}`)
    }
    revalidatePath('/sitemap.xml')
}

function esSlugDuplicado(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) return false
    const codigo = (error as { code?: string }).code
    const restriccion = String((error as { constraint?: string }).constraint ?? '')
    return codigo === '23505' && restriccion.includes('slug')
}

export async function guardarProducto(
    _prev: EstadoProducto,
    formData: FormData
): Promise<EstadoProducto> {
    if (!(await sesionActiva())) {
        return { error: 'Sesión expirada. Vuelve a iniciar sesión.' }
    }

    let entrada: ProductoInput
    try {
        entrada = leerEntrada(formData)
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Datos inválidos' }
    }

    const id = textoONulo(formData, 'id')
    const anterior = id ? await obtenerProductoPorId(id) : null

    try {
        if (id) {
            await actualizarProducto(id, entrada)
        } else {
            await crearProducto(entrada)
        }
    } catch (error) {
        console.error(error)
        const mensaje = esSlugDuplicado(error)
            ? 'Ya existe un producto con ese slug'
            : 'No se pudo guardar el producto'
        return { error: mensaje }
    }

    try {
        if (
            anterior?.imagen_principal &&
            anterior.imagen_principal !== entrada.imagen_principal &&
            !(await imagenEnUso(anterior.imagen_principal, id ?? undefined))
        ) {
            await eliminarImagenR2(anterior.imagen_principal)
        }
    } catch (error) {
        console.error('No se pudo limpiar la imagen anterior', error)
    }

    revalidarCatalogo(entrada.slug, anterior?.slug)
    redirect(`/admin/productos?ok=${id ? 'actualizado' : 'creado'}`)
}

export async function eliminarProductoAction(formData: FormData): Promise<void> {
    if (!(await sesionActiva())) {
        throw new Error('No autorizado')
    }
    const id = String(formData.get('id') ?? '')
    if (!id) return

    const producto = await obtenerProductoPorId(id)
    await eliminarProducto(id)

    try {
        if (
            producto?.imagen_principal &&
            !(await imagenEnUso(producto.imagen_principal))
        ) {
            await eliminarImagenR2(producto.imagen_principal)
        }
    } catch (error) {
        console.error('No se pudo limpiar la imagen del producto', error)
    }

    revalidatePath('/admin/productos')
    if (producto?.slug) revalidatePath(`/producto/${producto.slug}`)
    revalidatePath('/sitemap.xml')
    redirect('/admin/productos?ok=eliminado')
}

export async function solicitarUrlSubida(
    contentType: string,
    tamaño: number
): Promise<{ uploadUrl: string; publicUrl: string } | { error: string }> {
    if (!(await sesionActiva())) {
        return { error: 'Sesión expirada. Vuelve a iniciar sesión.' }
    }
    if (!r2Configurado()) {
        return { error: 'El almacenamiento de imágenes (R2) no está configurado.' }
    }
    if (!TIPOS_IMAGEN_PERMITIDOS.includes(contentType)) {
        return { error: 'Formato no permitido. Usa JPG, PNG, WEBP o AVIF.' }
    }
    if (!Number.isFinite(tamaño) || tamaño <= 0 || tamaño > MAX_IMAGEN_BYTES) {
        return { error: `La imagen no puede superar ${formatearMB(MAX_IMAGEN_BYTES)}.` }
    }
    try {
        return await crearUrlSubida(contentType)
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'No se pudo preparar la subida' }
    }
}
