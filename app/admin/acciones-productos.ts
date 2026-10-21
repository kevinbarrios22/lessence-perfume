'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sesionActiva } from '@/lib/sesion'
import { crearUrlSubida, r2Configurado } from '@/lib/r2'
import { limpiarSlug } from '@/lib/slug'
import {
    actualizarProducto,
    crearProducto,
    eliminarProducto,
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
    for (const item of datos) {
        if (typeof item !== 'object' || item === null) continue
        const tamaño = String((item as Record<string, unknown>).tamaño ?? '').trim()
        const precio = Number((item as Record<string, unknown>).precio)
        if (!tamaño) continue
        if (!Number.isInteger(precio) || precio < PRECIO_MINIMO_COP) {
            throw new Error(
                `El precio de "${tamaño}" debe estar en pesos colombianos, sin puntos ni centavos (ej: 84900).`
            )
        }
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

function revalidarCatalogo(slug: string) {
    revalidatePath('/')
    revalidatePath('/admin/productos')
    revalidatePath(`/producto/${slug}`)
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

    try {
        if (id) {
            await actualizarProducto(id, entrada)
        } else {
            await crearProducto(entrada)
        }
    } catch (error) {
        console.error(error)
        const mensaje =
            error instanceof Error && error.message.includes('duplicate')
                ? 'Ya existe un producto con ese slug'
                : 'No se pudo guardar el producto'
        return { error: mensaje }
    }

    revalidarCatalogo(entrada.slug)
    redirect(`/admin/productos?ok=${id ? 'actualizado' : 'creado'}`)
}

export async function eliminarProductoAction(formData: FormData): Promise<void> {
    if (!(await sesionActiva())) {
        throw new Error('No autorizado')
    }
    const id = String(formData.get('id') ?? '')
    if (!id) return
    await eliminarProducto(id)
    revalidatePath('/')
    revalidatePath('/admin/productos')
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
