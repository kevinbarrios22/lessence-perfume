'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sesionActiva } from '@/lib/sesion'
import { eliminarImagenR2 } from '@/lib/r2'
import {
    actualizarActivoBanner,
    actualizarBanner,
    crearBanner,
    eliminarBanner,
    esIdBannerValido,
    imagenBannerEnUso,
    obtenerBannerPorId,
    type BannerInput,
} from '@/lib/banners'

export type EstadoBanner = { error?: string }

function texto(formData: FormData, campo: string): string {
    return String(formData.get(campo) ?? '').trim()
}

function leerEntrada(formData: FormData): BannerInput {
    const imagen = texto(formData, 'imagen')
    if (!imagen) {
        throw new Error('Subí una imagen para el banner.')
    }

    const ordenBruto = Number.parseInt(texto(formData, 'orden'), 10)
    const orden = Number.isFinite(ordenBruto)
        ? Math.max(-9999, Math.min(9999, ordenBruto))
        : 0

    return {
        imagen,
        texto_alt: (texto(formData, 'texto_alt') || 'Promoción').slice(0, 300),
        orden,
        activo: formData.get('activo') === 'on',
    }
}

export async function guardarBanner(
    _prev: EstadoBanner,
    formData: FormData
): Promise<EstadoBanner> {
    if (!(await sesionActiva())) {
        return { error: 'Sesión expirada. Vuelve a iniciar sesión.' }
    }

    const id = texto(formData, 'id')
    if (id && !esIdBannerValido(id)) {
        return { error: 'Banner inválido.' }
    }

    let entrada: BannerInput
    try {
        entrada = leerEntrada(formData)
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Datos inválidos' }
    }

    const anterior = id ? await obtenerBannerPorId(id) : null

    try {
        if (id) {
            await actualizarBanner(id, entrada)
        } else {
            await crearBanner(entrada)
        }
    } catch (error) {
        console.error(error)
        return { error: 'No se pudo guardar el banner' }
    }

    try {
        if (
            anterior?.imagen &&
            anterior.imagen !== entrada.imagen &&
            !(await imagenBannerEnUso(anterior.imagen, id))
        ) {
            await eliminarImagenR2(anterior.imagen)
        }
    } catch (error) {
        console.error('No se pudo limpiar la imagen anterior del banner', error)
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    redirect(`/admin/banners?ok=${id ? 'actualizado' : 'creado'}`)
}

export async function eliminarBannerAction(formData: FormData): Promise<void> {
    if (!(await sesionActiva())) {
        throw new Error('No autorizado')
    }
    const id = texto(formData, 'id')
    if (!id) return

    const banner = await obtenerBannerPorId(id)
    await eliminarBanner(id)

    try {
        if (banner?.imagen && !(await imagenBannerEnUso(banner.imagen))) {
            await eliminarImagenR2(banner.imagen)
        }
    } catch (error) {
        console.error('No se pudo limpiar la imagen del banner', error)
    }

    revalidatePath('/')
    revalidatePath('/admin/banners')
    redirect('/admin/banners?ok=eliminado')
}

export async function alternarBannerAction(formData: FormData): Promise<void> {
    if (!(await sesionActiva())) {
        throw new Error('No autorizado')
    }
    const id = texto(formData, 'id')
    if (!id) return

    await actualizarActivoBanner(id, formData.get('activo') === 'true')
    revalidatePath('/')
    revalidatePath('/admin/banners')
}
