export async function subirImagenFirmada(
    uploadUrl: string,
    archivo: File,
    hacerFetch: typeof fetch = fetch
): Promise<void> {
    const respuesta = await hacerFetch(uploadUrl, {
        method: 'PUT',
        body: archivo,
        headers: { 'Content-Type': archivo.type },
    })

    if (!respuesta.ok) {
        throw new Error(`No se pudo subir la imagen (${respuesta.status}).`)
    }
}
