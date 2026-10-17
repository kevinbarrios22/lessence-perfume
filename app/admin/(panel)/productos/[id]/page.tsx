import { notFound } from 'next/navigation'
import { obtenerProductoPorId } from '@/lib/productos'
import ProductoForm from '../ProductoForm'

export const metadata = { title: 'Editar producto' }
export const dynamic = 'force-dynamic'

export default async function EditarProductoPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const producto = await obtenerProductoPorId(id)

    if (!producto) {
        notFound()
    }

    return (
        <main>
            <h1 className="font-serif text-2xl tracking-tight text-humo mb-8">
                Editar producto
            </h1>
            <ProductoForm producto={producto} />
        </main>
    )
}
