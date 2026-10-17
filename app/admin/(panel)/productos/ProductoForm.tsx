'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import type { Producto } from '@/lib/productos'
import { ETIQUETAS_DISPONIBLES } from '@/lib/etiquetas'
import { guardarProducto, solicitarUrlSubida, type EstadoProducto } from '@/app/admin/acciones-productos'

type FilaVariante = {
    key: string
    tamaño: string
    precio: string
    disponible: boolean
}

function nuevaFila(): FilaVariante {
    return {
        key: crypto.randomUUID(),
        tamaño: '',
        precio: '',
        disponible: true,
    }
}

const campoBase =
    'rounded-sm border border-alabastro bg-white px-3 py-2 text-sm text-humo outline-none focus:border-cobre'
const campo = `w-full ${campoBase}`
const etiqueta = 'block text-cobre text-[11px] tracking-[0.15em] uppercase mb-1'
const seccionTitulo = 'font-serif text-lg tracking-tight text-humo mb-4'

export default function ProductoForm({ producto }: { producto?: Producto }) {
    const estadoInicial: EstadoProducto = {}
    const [estado, formAction, pending] = useActionState(guardarProducto, estadoInicial)

    const [variantes, setVariantes] = useState<FilaVariante[]>(
        producto && producto.variantes.length > 0
            ? producto.variantes.map((v) => ({
                key: v.id,
                tamaño: v.tamaño,
                precio: String(v.precio),
                disponible: v.disponible,
            }))
            : [nuevaFila()]
    )
    const [imagen, setImagen] = useState(producto?.imagen_principal ?? '')
    const [subiendo, setSubiendo] = useState(false)
    const [errorImagen, setErrorImagen] = useState<string | null>(null)
    const [arrastrando, setArrastrando] = useState(false)

    function actualizarFila(key: string, cambios: Partial<FilaVariante>) {
        setVariantes((prev) => prev.map((f) => (f.key === key ? { ...f, ...cambios } : f)))
    }

    function quitarFila(key: string) {
        setVariantes((prev) => prev.filter((f) => f.key !== key))
    }

    async function procesarArchivo(archivo: File) {
        setSubiendo(true)
        setErrorImagen(null)

        const respuesta = await solicitarUrlSubida(archivo.name, archivo.type)
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

    const variantesJson = JSON.stringify(
        variantes.map((v) => ({
            tamaño: v.tamaño.trim(),
            precio: Number(v.precio) || 0,
            disponible: v.disponible,
        }))
    )

    return (
        <form action={formAction} className="space-y-8">
            {producto && <input type="hidden" name="id" value={producto.id} />}
            <input type="hidden" name="variantes" value={variantesJson} />
            <input type="hidden" name="imagen_principal" value={imagen} />

            {estado.error && (
                <p
                    aria-live="polite"
                    className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {estado.error}
                </p>
            )}

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-8">
                    <section>
                        <h2 className={seccionTitulo}>Información</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className={etiqueta} htmlFor="nombre">Nombre</label>
                                <input id="nombre" name="nombre" required defaultValue={producto?.nombre} className={campo} />
                            </div>
                            <div>
                                <label className={etiqueta} htmlFor="marca">Marca</label>
                                <input id="marca" name="marca" defaultValue={producto?.marca} className={campo} />
                            </div>
                            <div>
                                <label className={etiqueta} htmlFor="genero">Género</label>
                                <input id="genero" name="genero" defaultValue={producto?.genero} className={campo} />
                            </div>
                            <div>
                                <label className={etiqueta} htmlFor="tipo">Tipo</label>
                                <input id="tipo" name="tipo" defaultValue={producto?.tipo} placeholder="Eau de Parfum" className={campo} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={etiqueta} htmlFor="slug">Slug (URL)</label>
                                <input
                                    id="slug"
                                    name="slug"
                                    defaultValue={producto?.slug}
                                    placeholder="se-genera-del-nombre-si-se-deja-vacio"
                                    className={campo}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={etiqueta} htmlFor="descripcion">Descripción</label>
                                <textarea id="descripcion" name="descripcion" rows={3} defaultValue={producto?.descripcion} className={campo} />
                            </div>
                        </div>
                    </section>

                    <section className="border-t border-alabastro pt-6">
                        <h2 className={seccionTitulo}>Notas olfativas</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <input name="notas_salida" defaultValue={producto?.notas_salida ?? ''} placeholder="Salida" className={campo} aria-label="Notas de salida" />
                            <input name="notas_corazon" defaultValue={producto?.notas_corazon ?? ''} placeholder="Corazón" className={campo} aria-label="Notas de corazón" />
                            <input name="notas_fondo" defaultValue={producto?.notas_fondo ?? ''} placeholder="Fondo" className={campo} aria-label="Notas de fondo" />
                        </div>
                    </section>

                    <section className="border-t border-alabastro pt-6">
                        <h2 className={seccionTitulo}>Tamaños y precios</h2>
                        <div className="space-y-3">
                            {variantes.map((fila) => (
                                <div key={fila.key} className="flex flex-wrap items-center gap-3">
                                    <input
                                        value={fila.tamaño}
                                        onChange={(e) => actualizarFila(fila.key, { tamaño: e.target.value })}
                                        placeholder="100ml"
                                        aria-label="Tamaño"
                                        className={`${campoBase} w-32`}
                                    />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={fila.precio}
                                        onChange={(e) => actualizarFila(fila.key, { precio: e.target.value })}
                                        placeholder="Precio"
                                        aria-label="Precio"
                                        className={`${campoBase} w-28`}
                                    />
                                    <label className="flex items-center gap-2 text-sm text-humo">
                                        <input
                                            type="checkbox"
                                            checked={fila.disponible}
                                            onChange={(e) => actualizarFila(fila.key, { disponible: e.target.checked })}
                                        />
                                        Disponible
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => quitarFila(fila.key)}
                                        className="ml-auto text-xs underline text-nude hover:text-cobre"
                                    >
                                        Quitar
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setVariantes((prev) => [...prev, nuevaFila()])}
                            className="mt-3 text-sm underline text-cobre"
                        >
                            + Añadir tamaño
                        </button>
                    </section>
                </div>

                <aside className="space-y-6 lg:sticky lg:top-24 self-start">
                    <section className="rounded-md border border-alabastro bg-white p-4">
                        <h2 className="mb-3 font-serif text-base text-humo">Imagen principal</h2>

                        {imagen ? (
                            <div className="space-y-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={imagen}
                                    alt="Vista previa"
                                    className="aspect-[4/5] w-full rounded-sm border border-alabastro object-cover"
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
                                className={`flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 text-center transition-colors ${
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
                                    accept="image/jpeg,image/png,image/webp,image/avif"
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
                            aria-label="URL de imagen"
                            className={`${campo} mt-3`}
                        />
                    </section>

                    <section className="rounded-md border border-alabastro bg-white p-4">
                        <h2 className="mb-1 font-serif text-base text-humo">Etiquetas</h2>
                        <p className="mb-3 text-xs text-nude">
                            Se muestran como sellos sobre el producto en la tienda.
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {ETIQUETAS_DISPONIBLES.map((nombreEtiqueta) => (
                                <label
                                    key={nombreEtiqueta}
                                    className="cursor-pointer rounded-full border border-alabastro px-3 py-1.5 text-xs text-humo transition-colors select-none has-[:checked]:border-cobre has-[:checked]:bg-cobre has-[:checked]:text-porcelana"
                                >
                                    <input
                                        type="checkbox"
                                        name="etiquetas"
                                        value={nombreEtiqueta}
                                        defaultChecked={producto?.etiquetas?.includes(nombreEtiqueta)}
                                        className="sr-only"
                                    />
                                    {nombreEtiqueta}
                                </label>
                            ))}
                        </div>
                    </section>

                    <label className="flex items-center gap-2 rounded-md border border-alabastro bg-white p-4 text-sm text-humo">
                        <input type="checkbox" name="disponible" defaultChecked={producto?.disponible ?? true} />
                        Visible en el catálogo
                    </label>
                </aside>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center gap-4 border-t border-alabastro bg-porcelana/95 py-4 backdrop-blur">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-6 py-3 rounded-sm text-sm text-porcelana disabled:opacity-50"
                    style={{ background: 'var(--humo)' }}
                >
                    {pending ? 'Guardando…' : producto ? 'Guardar cambios' : 'Crear producto'}
                </button>
                <Link href="/admin/productos" className="text-sm underline text-nude hover:text-cobre">
                    Cancelar
                </Link>
            </div>
        </form>
    )
}
