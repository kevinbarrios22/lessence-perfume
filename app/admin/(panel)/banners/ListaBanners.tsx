import Link from 'next/link'
import ProductImage from '@/components/ProductImage'
import { alternarBannerAction } from '@/app/admin/acciones-banners'
import type { Banner } from '@/lib/banners'
import BotonEliminarBanner from './BotonEliminarBanner'

export default function ListaBanners({ banners }: { banners: Banner[] }) {
    if (banners.length === 0) {
        return (
            <div className="rounded-md border border-dashed border-alabastro py-16 text-center text-sm text-nude">
                Todavía no hay banners. Subí el primero para mostrarlo al inicio de la tienda.
            </div>
        )
    }

    return (
        <ul className="space-y-3">
            {banners.map((banner) => (
                <li
                    key={banner.id}
                    className="flex flex-col gap-4 rounded-md border border-alabastro bg-white p-4 sm:flex-row sm:items-center"
                >
                    <ProductImage
                        src={banner.imagen}
                        alt={banner.texto_alt}
                        sizes="(max-width: 640px) 100vw, 220px"
                        className="aspect-[16/7] w-full shrink-0 rounded-sm sm:w-56"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-humo">{banner.texto_alt}</p>
                        <p className="text-xs text-nude">Orden {banner.orden}</p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] ${
                                banner.activo
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-neutral-100 text-neutral-500'
                            }`}
                        >
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {banner.activo ? 'Visible' : 'Oculto'}
                        </span>

                        <form action={alternarBannerAction}>
                            <input type="hidden" name="id" value={banner.id} />
                            <input
                                type="hidden"
                                name="activo"
                                value={String(!banner.activo)}
                            />
                            <button
                                type="submit"
                                className="px-3 py-1.5 rounded-sm text-xs border border-alabastro text-humo transition-colors hover:border-cobre"
                            >
                                {banner.activo ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </form>

                        <Link
                            href={`/admin/banners/${banner.id}`}
                            className="px-3 py-1.5 rounded-sm text-xs border border-alabastro text-humo transition-colors hover:border-cobre"
                        >
                            Editar
                        </Link>

                        <BotonEliminarBanner id={banner.id} nombre={banner.texto_alt} />
                    </div>
                </li>
            ))}
        </ul>
    )
}
