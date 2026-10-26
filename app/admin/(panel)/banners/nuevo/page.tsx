import BannerForm from '../BannerForm'

export const metadata = { title: 'Nuevo banner' }
export const dynamic = 'force-dynamic'

export default function NuevoBannerPage() {
    return (
        <main>
            <h1 className="font-serif text-2xl tracking-tight text-humo mb-8">Nuevo banner</h1>
            <BannerForm />
        </main>
    )
}
