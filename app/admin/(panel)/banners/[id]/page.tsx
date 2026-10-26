import { notFound } from 'next/navigation'
import { obtenerBannerPorId } from '@/lib/banners'
import BannerForm from '../BannerForm'

export const metadata = { title: 'Editar banner' }
export const dynamic = 'force-dynamic'

export default async function EditarBannerPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const banner = await obtenerBannerPorId(id)

    if (!banner) {
        notFound()
    }

    return (
        <main>
            <h1 className="font-serif text-2xl tracking-tight text-humo mb-8">
                Editar banner
            </h1>
            <BannerForm banner={banner} />
        </main>
    )
}
