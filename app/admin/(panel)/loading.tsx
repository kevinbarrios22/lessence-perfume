export default function Loading() {
    return (
        <div aria-busy="true" aria-label="Cargando">
            <div className="mb-6 h-8 w-40 rounded-sm bg-alabastro/50 animate-pulse" />

            <div className="mb-6 flex flex-wrap gap-3">
                <div className="h-10 min-w-48 flex-1 rounded-sm bg-alabastro/40 animate-pulse" />
                <div className="h-10 w-36 rounded-sm bg-alabastro/40 animate-pulse" />
            </div>

            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-16 rounded-sm bg-alabastro/30 animate-pulse" />
                ))}
            </div>
        </div>
    )
}
