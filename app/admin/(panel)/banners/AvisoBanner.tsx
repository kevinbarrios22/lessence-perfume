'use client'

import { useState } from 'react'

const MENSAJES: Record<string, string> = {
    creado: 'Banner creado correctamente.',
    actualizado: 'Cambios guardados correctamente.',
    eliminado: 'Banner eliminado.',
}

export default function AvisoBanner({ tipo }: { tipo: string }) {
    const [visible, setVisible] = useState(true)
    if (!visible) return null

    return (
        <div
            role="status"
            className="mb-6 flex items-center justify-between gap-4 rounded-sm border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
            <span>{MENSAJES[tipo] ?? 'Listo.'}</span>
            <button
                type="button"
                onClick={() => setVisible(false)}
                aria-label="Cerrar aviso"
                className="text-lg leading-none text-green-700/70 hover:text-green-800"
            >
                ×
            </button>
        </div>
    )
}
