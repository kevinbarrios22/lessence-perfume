'use client'

import { useActionState } from 'react'
import { iniciarSesion, type EstadoLogin } from '@/app/admin/actions'

export default function LoginForm() {
    const estadoInicial: EstadoLogin = {}
    const [estado, formAction, pending] = useActionState(iniciarSesion, estadoInicial)

    return (
        <form action={formAction} className="space-y-5">
            {estado.error && (
                <p
                    aria-live="polite"
                    className="rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    {estado.error}
                </p>
            )}

            <div>
                <label
                    htmlFor="password"
                    className="block text-cobre text-[11px] tracking-[0.15em] uppercase mb-2"
                >
                    Contraseña
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoFocus
                    className="w-full rounded-sm border border-alabastro bg-white px-3 py-2 text-sm text-humo outline-none focus:border-cobre"
                />
            </div>

            <button
                type="submit"
                disabled={pending}
                className="w-full py-3 rounded-sm text-sm text-porcelana disabled:opacity-50"
                style={{ background: 'var(--humo)' }}
            >
                {pending ? 'Entrando…' : 'Entrar'}
            </button>
        </form>
    )
}
