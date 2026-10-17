import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

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

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export async function crearUrlSubida(
    nombreOriginal: string,
    contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }> {
    if (!TIPOS_PERMITIDOS.includes(contentType)) {
        throw new Error('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.')
    }

    const extension = nombreOriginal.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
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
