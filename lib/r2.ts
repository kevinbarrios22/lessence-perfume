
import { env } from 'cloudflare:workers'
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { claveImagenR2, TIPOS_IMAGEN_PERMITIDOS } from './imagen'

type R2Config = {
    R2_ACCOUNT_ID?: string
    R2_ACCESS_KEY_ID?: string
    R2_SECRET_ACCESS_KEY?: string
    R2_BUCKET?: string
    R2_PUBLIC_URL?: string
}

function getConfig(): R2Config {
    const bindings = env as unknown as R2Config

    return {
        R2_ACCOUNT_ID: bindings.R2_ACCOUNT_ID ?? process.env.R2_ACCOUNT_ID,
        R2_ACCESS_KEY_ID: bindings.R2_ACCESS_KEY_ID ?? process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: bindings.R2_SECRET_ACCESS_KEY ?? process.env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET: bindings.R2_BUCKET ?? process.env.R2_BUCKET,
        R2_PUBLIC_URL: bindings.R2_PUBLIC_URL ?? process.env.R2_PUBLIC_URL,
    }
}

export function r2Configurado(): boolean {
    const config = getConfig()

    return Boolean(
        config.R2_ACCOUNT_ID &&
        config.R2_ACCESS_KEY_ID &&
        config.R2_SECRET_ACCESS_KEY &&
        config.R2_BUCKET &&
        config.R2_PUBLIC_URL
    )
}

function getCliente(config: R2Config): S3Client {
    if (!r2Configurado()) {
        throw new Error('Falta configurar las variables R2_* en el entorno')
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${config.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: config.R2_ACCESS_KEY_ID!,
            secretAccessKey: config.R2_SECRET_ACCESS_KEY!,
        },
    })
}

const EXTENSION_POR_TIPO: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
}

export type CarpetaImagen = 'productos' | 'banners'

export async function crearUrlSubida(
    contentType: string,
    carpeta: CarpetaImagen = 'productos'
): Promise<{ uploadUrl: string; publicUrl: string }> {
    const extension = EXTENSION_POR_TIPO[contentType]

    if (!extension || !TIPOS_IMAGEN_PERMITIDOS.includes(contentType)) {
        throw new Error('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.')
    }

    if (carpeta !== 'productos' && carpeta !== 'banners') {
        throw new Error('Carpeta de imagenes no válida')
    }

    const config = getConfig()
    const key = `${carpeta}/${randomUUID()}.${extension}`

    const uploadUrl = await getSignedUrl(
        getCliente(config),
        new PutObjectCommand({
            Bucket: config.R2_BUCKET,
            Key: key,
            ContentType: contentType,
        }),
        { expiresIn: 600 }
    )

    const base = config.R2_PUBLIC_URL!.replace(/\/$/, '')

    return {
        uploadUrl,
        publicUrl: `${base}/${key}`,
    }
}

export async function eliminarImagenR2(
    publicUrl: string | null | undefined
): Promise<void> {
    const key = claveImagenR2(publicUrl)

    if (!key || !r2Configurado()) return

    try {
        const config = getConfig()

        await getCliente(config).send(
            new DeleteObjectCommand({
                Bucket: config.R2_BUCKET,
                Key: key,
            })
        )
    } catch (error) {
        console.error('No se pudo eliminar la imagen de R2', error)
    }
}
