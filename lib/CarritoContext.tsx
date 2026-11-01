'use client'

import {
    createContext,
    useContext,
    useSyncExternalStore,
    ReactNode,
} from 'react'
import {
    agregarItemCarrito,
    cambiarCantidadCarrito,
    leerItemsCarrito,
    quitarItemCarrito,
    resumirCarrito,
    type ItemCarrito,
    type NuevoItemCarrito,
} from '@/lib/carrito-estado'

type CarritoContextType = {
    items: ItemCarrito[]
    agregarItem: (item: NuevoItemCarrito) => void
    quitarItem: (varianteId: string) => void
    cambiarCantidad: (varianteId: string, cantidad: number) => void
    total: number
    cantidadTotal: number
}

const CarritoContext = createContext<CarritoContextType | undefined>(undefined)

const STORAGE_KEY = 'perfumeria-carrito-v1'

let items: ItemCarrito[] = []
const itemsServidor: ItemCarrito[] = []
let cargadoInicial = false
const listeners = new Set<() => void>()

function cargarDeStorage(): ItemCarrito[] {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        return leerItemsCarrito(raw)
    } catch {
        return []
    }
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => {
        listeners.delete(listener)
    }
}

function getSnapshot(): ItemCarrito[] {
    if (typeof window !== 'undefined' && !cargadoInicial) {
        cargadoInicial = true
        items = cargarDeStorage()
    }
    return items
}

function getServerSnapshot(): ItemCarrito[] {
    return itemsServidor
}

function persistir(nuevos: ItemCarrito[]) {
    items = nuevos
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
    } catch {
        // Storage lleno o bloqueado: el carrito sigue funcionando en memoria
    }
    listeners.forEach((listener) => listener())
}

export function CarritoProvider({ children }: { children: ReactNode }) {
    const itemsActuales = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    )

    function agregarItem(nuevoItem: NuevoItemCarrito) {
        persistir(agregarItemCarrito(getSnapshot(), nuevoItem))
    }

    function quitarItem(varianteId: string) {
        persistir(quitarItemCarrito(getSnapshot(), varianteId))
    }

    function cambiarCantidad(varianteId: string, cantidad: number) {
        persistir(cambiarCantidadCarrito(getSnapshot(), varianteId, cantidad))
    }

    const { total, cantidadTotal } = resumirCarrito(itemsActuales)

    return (
        <CarritoContext.Provider
            value={{
                items: itemsActuales,
                agregarItem,
                quitarItem,
                cambiarCantidad,
                total,
                cantidadTotal,
            }}
        >
            {children}
        </CarritoContext.Provider>
    )
}

export function useCarrito() {
    const context = useContext(CarritoContext)
    if (!context) {
        throw new Error('useCarrito debe usarse dentro de CarritoProvider')
    }
    return context
}
