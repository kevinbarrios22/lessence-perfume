import ProductoForm from '../ProductoForm'

export const metadata = { title: 'Nuevo producto' }
export const dynamic = 'force-dynamic'

export default function NuevoProductoPage() {
    return (
        <main>
            <h1 className="font-serif text-2xl tracking-tight text-humo mb-8">Nuevo producto</h1>
            <ProductoForm />
        </main>
    )
}
