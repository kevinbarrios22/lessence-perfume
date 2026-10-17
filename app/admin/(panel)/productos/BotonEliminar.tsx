'use client'

import { eliminarProductoAction } from '@/app/admin/acciones-productos'

export default function BotonEliminar({ id, nombre }: { id: string; nombre: string }) {
    return (
        <form
            action={eliminarProductoAction}
            onSubmit={(e) => {
                if (!window.confirm(`¿Eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
                    e.preventDefault()
                }
            }}
        >
            <input type="hidden" name="id" value={id} />
            <button
                type="submit"
                className="px-3 py-1.5 rounded-sm text-xs border border-red-200 text-red-600 transition-colors hover:bg-red-50"
            >
                Eliminar
            </button>
        </form>
    )
}
