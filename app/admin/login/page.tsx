import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
    title: 'Acceso administrador',
    robots: { index: false, follow: false },
}

export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-porcelana px-6 py-16">
            <div className="w-full max-w-sm rounded-md border border-alabastro bg-white/70 p-8">
                <p className="text-cobre text-[11px] tracking-[0.2em] uppercase text-center">
                    L&apos;ESSENCE
                </p>
                <h1 className="font-serif text-2xl tracking-tight text-humo text-center mt-2 mb-8">
                    Panel de administración
                </h1>
                <LoginForm />
            </div>
        </main>
    )
}
