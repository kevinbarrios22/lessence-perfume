'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import type { Banner } from '@/lib/banners'
import {
    ACCEPT_IMAGEN,
    formatearMB,
    MAX_IMAGEN_BYTES,
    TIPOS_IMAGEN_PERMITIDOS,
} from '@/lib/imagen'
import { guardarBanner, type EstadoBanner } from '@/app/admin/acciones-banners'
import { solicitarUrlSubida } from '@/app/admin/acciones-imagenes'

const campoBase =
    'rounded-sm border border-alabastro bg-white px-3 py-2 text-sm text-humo outline-none focus:border-cobre'
const campo = `w-full ${campoBase}`
const etiqueta = 'block text-cobre text-[11px] tracking-[0.15em] uppercase mb-1'

export default function BannerForm({ banner }: { banner?: Banner }) {
    const estadoInicial: EstadoBanner = {}
    const [estado, formAction, pending] = useActionState(guardarBanner, estadoInicial)

    const [imagen, setImagen] = useState(banner?.imagen ?? '')
    const [subiendo, setSubiendo] = useState(false)
    const [errorImagen, setErrorImagen] = useState<string | null>(null)
    const [arrastrando, setArrastrando] = useState(false)

    async function procesarArchivo(archivo: File) {
        setErrorImagen(null)

        if (!TIPOS_IMAGEN_PERMITIDOS.includes(archivo.type)) {
            setErrorImagen('Formato no permitido. Usa JPG, PNG, WEBP o AVIF.')
            return
        }
        if (archivo.size > MAX_IMAGEN_BYTES) {
            setErrorImagen(
                `La imagen pesa ${formatearMB(archivo.size)}; el máximo es ${formatearMB(MAX_IMAGEN_BYTES)}.`
            )
            return
        }

        setSubiendo(true)

        const respuesta = await solicitarUrlSubida(archivo.type, archivo.size, 'banners')
        if ('error' in respuesta) {
            setErrorImagen(respuesta.error)
            setSubiendo(false)
            return
        }

        try {
            const subida = await fetch(respuesta.uploadUrl, {
                method: 'PUT',
                body: archivo,
                headers: { 'Content-Type': archivo.type },
            })
            if (!subida.ok) throw new Error('fallo de subida')
            setImagen(respuesta.publicUrl)
        } catch {
            setErrorImagen('No se pudo subir la imagen. Revisa la configuración de R2.')
        } finally {
            setSubiendo(false)
        }
    }

    function subirArchivo(e: React.ChangeEvent<HTMLInputElement>) {
        const archivo = e.target.files?.[0]
        if (archivo) procesarArchivo(archivo)
    }

    function alSoltar(e: React.DragEvent) {
        e.preventDefault()
        setArrastrando(false)
        const archivo = e.dataTransfer.files?.[0]
        if (archivo) procesarArchivo(archivo)
    }

    return (
        <form action={formAction} className="max-w-3xl space-y-6">
            {banner && <input type="hidden" name="id" value={banner.id} />}
            <input type="hidden" name="imagen" value={imagen} />

            {estado.error && (
                <p
                    aria-live="polite"
                    className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {estado.error}
                </p>
            )}

            <section className="rounded-md border border-alabastro bg-white p-4">
                <h2 className="mb-3 font-serif text-base text-humo">Imagen del banner</h2>

                {imagen ? (
                    <div className="space-y-3">
                        <ProductImage
                            src={imagen}
                            alt="Vista previa del banner"
                            sizes="(max-width: 768px) 100vw, 720px"
                            className="aspect-[16/7] w-full rounded-sm border border-alabastro"
                        />
                        <button
                            type="button"
                            onClick={() => setImagen('')}
                            className="text-xs underline text-nude hover:text-cobre"
                        >
                            Quitar imagen
                        </button>
                    </div>
                ) : (
                    <label
                        onDragOver={(e) => {
                            e.preventDefault()
                            setArrastrando(true)
                        }}
                        onDragLeave={() => setArrastrando(false)}
                        onDrop={alSoltar}
                        className={`flex aspect-[16/7] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 text-center transition-colors ${
                            arrastrando ? 'border-cobre bg-porcelana' : 'border-alabastro hover:border-cobre'
                        }`}
                    >
                        <svg
                            width="26"
                            height="26"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-cobre"
                            aria-hidden="true"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-sm text-humo">
                            {arrastrando ? 'Soltá la imagen' : 'Arrastrá o hacé clic para subir'}
                        </span>
                        <span className="text-xs text-nude">
                            JPG, PNG, WEBP o AVIF · hasta 5&nbsp;MB
                        </span>
                        <input
                            type="file"
                            accept={ACCEPT_IMAGEN}
                            onChange={subirArchivo}
                            disabled={subiendo}
                            className="sr-only"
                        />
                    </label>
                )}

                {subiendo && <p className="mt-3 text-xs text-nude">Subiendo…</p>}
                {errorImagen && <p className="mt-3 text-xs text-red-600">{errorImagen}</p>}

                <input
                    value={imagen}
                    onChange={(e) => setImagen(e.target.value)}
                    placeholder="…o pegá una URL de imagen"
                    aria-label="URL de imagen del banner"
                    className={`${campo} mt-3`}
                />

                <p className="mt-2 text-xs text-nude">
                    Recomendado: imagen horizontal de 1600 × 600 px. En celular se recorta al centro.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
                <div>
                    <label className={etiqueta} htmlFor="texto_alt">
                        Texto alternativo
                    </label>
                    <input
                        id="texto_alt"
                        name="texto_alt"
                        maxLength={300}
                        defaultValue={banner?.texto_alt ?? 'Promoción'}
                        className={campo}
                    />
                    <p className="mt-1 text-xs text-nude">
                        Describe la promo para accesibilidad y si la imagen no carga.
                    </p>
                </div>
                <div>
                    <label className={etiqueta} htmlFor="orden">
                        Orden
                    </label>
                    <input
                        id="orden"
                        name="orden"
                        type="number"
                        defaultValue={banner?.orden ?? 0}
                        className={campo}
                    />
                </div>
            </section>

            <label className="flex items-center gap-2 rounded-md border border-alabastro bg-white p-4 text-sm text-humo">
                <input
                    type="checkbox"
                    name="activo"
                    defaultChecked={banner?.activo ?? true}
                />
                Visible en el inicio
            </label>

            <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-alabastro bg-porcelana/95 py-4 backdrop-blur">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-3 rounded-sm text-sm text-porcelana disabled:opacity-50"
                    style={{ background: 'var(--humo)' }}
                >
                    {pending ? 'Guardando…' : banner ? 'Guardar cambios' : 'Crear banner'}
                </button>
                <Link href="/admin/banners" className="text-sm underline text-nude hover:text-cobre">
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
