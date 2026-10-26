'use server'

import { sesionActiva } from '@/lib/sesion'
import { crearUrlSubida, r2Configurado, type CarpetaImagen } from '@/lib/r2'
import {
    formatearMB,
    MAX_IMAGEN_BYTES,
    TIPOS_IMAGEN_PERMITIDOS,
} from '@/lib/imagen'

export async function solicitarUrlSubida(
    contentType: string,
    tamaño: number,
    carpeta: CarpetaImagen = 'productos'
): Promise<{ uploadUrl: string; publicUrl: string } | { error: string }> {
    if (!(await sesionActiva())) {
        return { error: 'Sesión expirada. Vuelve a iniciar sesión.' }
    }
    if (carpeta !== 'productos' && carpeta !== 'banners') {
        return { error: 'Carpeta de imagenes no válida.' }
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
        return await crearUrlSubida(contentType, carpeta)
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'No se pudo preparar la subida' }
    }
}
