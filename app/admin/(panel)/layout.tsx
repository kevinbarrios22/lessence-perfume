import Link from 'next/link'
import { redirect } from 'next/navigation'
import { sesionActiva } from '@/lib/sesion'
import { cerrarSesion } from '@/app/admin/actions'
import AdminNav from './AdminNav'

export default async function PanelLayout({
    children,
}: {
    children: React.ReactNode
}) {
    if (!(await sesionActiva())) {
        redirect('/admin/login')
    }

    return (
        <div className="min-h-screen bg-porcelana">
            <header className="sticky top-0 z-40 border-b border-alabastro bg-white/80 backdrop-blur">
                <div className="container-boutique flex min-h-16 flex-wrap items-center gap-x-5 gap-y-1 py-2.5">
                    <Link
                        href="/admin/productos"
                        className="font-serif text-base tracking-tight text-humo whitespace-nowrap"
                    >
                        L&apos;ESSENCE
                        <span className="align-middle text-[10px] uppercase tracking-[0.2em] text-cobre">
                            admin
                        </span>
                    </Link>

                    <div className="order-3 w-full sm:order-none sm:w-auto">
                        <AdminNav />
                    </div>

                    <div className="ml-auto flex items-center gap-4">
                        <Link
                            href="/"
                            className="hidden sm:inline text-sm text-nude hover:text-cobre whitespace-nowrap"
                        >
                            Ver tienda
                        </Link>
                        <form action={cerrarSesion}>
                            <button
                                type="submit"
                                className="text-sm text-nude hover:text-cobre whitespace-nowrap"
                            >
                                Salir
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            <div className="container-boutique py-8 md:py-10">
                <div className="mx-auto max-w-5xl">{children}</div>
            </div>
        </div>
    )
}
