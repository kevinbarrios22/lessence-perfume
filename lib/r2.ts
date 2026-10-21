import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'
import { claveImagenR2, TIPOS_IMAGEN_PERMITIDOS } from './imagen'

export function r2Configurado(): boolean {
    return Boolean(
        process.env.R2_ACCOUNT_ID &&
            process.env.R2_ACCESS_KEY_ID &&
            process.env.R2_SECRET_ACCESS_KEY &&
            process.env.R2_BUCKET &&
            process.env.R2_PUBLIC_URL
    )
}

let cliente: S3Client | undefined

function getCliente(): S3Client {
    if (!r2Configurado()) {
        throw new Error('Falta configurar las variables R2_* en el entorno')
    }
    if (!cliente) {
        cliente = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
                secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
            },
        })
    }
    return cliente
}

const EXTENSION_POR_TIPO: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
}

export async function crearUrlSubida(
    contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
    const extension = EXTENSION_POR_TIPO[contentType]
    if (!extension || !TIPOS_IMAGEN_PERMITIDOS.includes(contentType)) {
        throw new Error('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.')
    }

    const key = `productos/${randomUUID()}.${extension}`

    const uploadUrl = await getSignedUrl(
        getCliente(),
        new PutObjectCommand({
            Bucket: process.env.R2_BUCKET,
            Key: key,
            ContentType: contentType,
        }),
        { expiresIn: 600 }
    )

    const base = (process.env.R2_PUBLIC_URL as string).replace(/\/$/, '')
    return { uploadUrl, publicUrl: `${base}/${key}` }
}

export async function eliminarImagenR2(
    publicUrl: string | null | undefined
): Promise<void> {
    const key = claveImagenR2(publicUrl)
    if (!key || !r2Configurado()) return

    try {
        await getCliente().send(
            new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET,
                Key: key,
            })
        )
    } catch (error) {
        console.error('No se pudo eliminar la imagen de R2', error)
    }
}
