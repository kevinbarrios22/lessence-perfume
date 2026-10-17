'use client'

import {
    createContext,
    useContext,
    useSyncExternalStore,
    ReactNode,
} from 'react'

type ItemCarrito = {
    productoId: string
    nombre: string
    marca: string
    imagen: string
    varianteId: string
    tamaño: string
    precio: number
    cantidad: number
}

type CarritoContextType = {
    items: ItemCarrito[]
    agregarItem: (item: Omit<ItemCarrito, 'cantidad'>) => void
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
        if (!raw) return []
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed : []
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

    function agregarItem(nuevoItem: Omit<ItemCarrito, 'cantidad'>) {
        const actual = getSnapshot()
        const existente = actual.find((i) => i.varianteId === nuevoItem.varianteId)
        if (existente) {
            persistir(
                actual.map((i) =>
                    i.varianteId === nuevoItem.varianteId
                        ? { ...i, cantidad: i.cantidad + 1 }
                        : i
                )
            )
            return
        }
        persistir([...actual, { ...nuevoItem, cantidad: 1 }])
    }

    function quitarItem(varianteId: string) {
        persistir(getSnapshot().filter((i) => i.varianteId !== varianteId))
    }

    function cambiarCantidad(varianteId: string, cantidad: number) {
        if (cantidad <= 0) {
            quitarItem(varianteId)
            return
        }
        persistir(
            getSnapshot().map((i) =>
                i.varianteId === varianteId ? { ...i, cantidad } : i
            )
        )
    }

    const total = itemsActuales.reduce((sum, i) => sum + i.precio * i.cantidad, 0)
    const cantidadTotal = itemsActuales.reduce((sum, i) => sum + i.cantidad, 0)

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