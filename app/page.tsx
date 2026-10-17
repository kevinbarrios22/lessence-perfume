import type { Metadata } from 'next'
import { listarProductos } from '@/lib/productos'
import CatalogoCliente from '@/components/CatalogoCliente'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function Home() {
  let listado
  try {
    listado = await listarProductos()
  } catch (error) {
    console.error(error)
    return <p className="container-boutique py-12">Error cargando productos</p>
  }

  return (
    <main>
      <section className="container-boutique pt-10 pb-8 md:pt-20 md:pb-14 text-center">
        <p className="text-cobre text-[10px] md:text-[11px] tracking-[0.3em] uppercase mb-4">
          Perfumería selecta
        </p>
        <h1 className="font-serif text-3xl md:text-5xl tracking-tight text-humo max-w-2xl mx-auto leading-tight">
          Descubre tu verdadera esencia.
        </h1>
        <p className="text-sm md:text-base text-nude mt-4 max-w-md mx-auto">
          Fragancias únicas. Recuerdos inolvidables.
        </p>
      </section>

      <section id="catalogo" className="container-boutique pt-4 pb-12 md:pt-6 md:pb-20">
        <h2 className="font-serif text-xl md:text-2xl tracking-tight text-humo mb-6 md:mb-8">
          Fragancias
        </h2>

        <CatalogoCliente productos={listado} />
      </section>
    </main>
  )
}
