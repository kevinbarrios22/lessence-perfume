import Link from 'next/link'
import { listarBannersAdmin } from '@/lib/banners'
import AvisoBanner from './AvisoBanner'
import ListaBanners from './ListaBanners'

export const metadata = { title: 'Banners' }
export const dynamic = 'force-dynamic'

type Props = {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function primerValor(valor: string | string[] | undefined): string {
    return Array.isArray(valor) ? (valor[0] ?? '') : (valor ?? '')
}

export default async function BannersPage({ searchParams }: Props) {
    const sp = await searchParams
    const ok = primerValor(sp.ok)
    const banners = await listarBannersAdmin()

    return (
        <main>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl tracking-tight text-humo">Banners</h1>
                    <p className="mt-1 text-sm text-nude">
                        Imágenes promocionales que se muestran al inicio de la tienda.
                    </p>
                </div>
                <Link
                    href="/admin/banners/nuevo"
                    className="px-5 py-2.5 rounded-sm text-sm text-porcelana"
                    style={{ background: 'var(--humo)' }}
                >
                    Nuevo banner
                </Link>
            </div>

            {ok && <AvisoBanner tipo={ok} />}

            <ListaBanners banners={banners} />
        </main>
    )
}
