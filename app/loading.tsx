export default function Loading() {
    return (
        <main className="container-boutique py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                <div className="aspect-[4/5] rounded-sm bg-alabastro/40 animate-pulse" />
                <div className="space-y-4">
                    <div className="h-3 w-28 bg-alabastro/50 animate-pulse" />
                    <div className="h-10 w-3/4 bg-alabastro/40 animate-pulse" />
                    <div className="h-4 w-40 bg-alabastro/50 animate-pulse" />
                </div>
            </div>

            <div className="mt-14 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i}>
                        <div className="aspect-[4/5] rounded-sm bg-alabastro/40 animate-pulse" />
                        <div className="h-3 w-20 bg-alabastro/50 animate-pulse mx-auto mt-3" />
                        <div className="h-4 w-24 bg-alabastro/40 animate-pulse mx-auto mt-2" />
                    </div>
                ))}
            </div>
        </main>
    )
}