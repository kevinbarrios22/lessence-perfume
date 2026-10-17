import Image from 'next/image'

type Props = {
    src?: string | null
    alt: string
    priority?: boolean
    sizes?: string
    className?: string
}

function Placeholder({ alt }: { alt: string }) {
    return (
        <svg
            viewBox="0 0 400 500"
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={alt || 'Sin imagen disponible'}
            className="absolute inset-0 h-full w-full"
        >
            <rect width="400" height="500" fill="#F5F0E8" />
            <circle cx="200" cy="260" r="170" fill="#E8E0D2" />
            <circle cx="200" cy="260" r="120" fill="#DED4C3" />
            <g fill="none" stroke="#96835A" strokeWidth="2" opacity="0.6">
                <circle cx="200" cy="260" r="80" strokeDasharray="3 7" />
                <circle cx="200" cy="260" r="55" strokeDasharray="3 7" />
            </g>
            <rect x="170" y="118" width="60" height="38" rx="8" fill="#C4A68B" />
            <rect x="182" y="156" width="36" height="26" rx="6" fill="#C4A68B" />
            <rect x="136" y="182" width="128" height="180" rx="26" fill="#96835A" opacity="0.85" />
            <rect x="152" y="198" width="96" height="148" rx="18" fill="#F5F0E8" />
            <text
                x="200"
                y="286"
                textAnchor="middle"
                fontFamily="Georgia, serif"
                fontSize="30"
                letterSpacing="3"
                fill="#1A1611"
            >
                P
            </text>
        </svg>
    )
}

export default function ProductImage({ src, alt, priority = false, sizes, className = '' }: Props) {
    return (
        <div className={`relative overflow-hidden bg-alabastro/20 ${className}`}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes={sizes}
                    priority={priority}
                    className="object-cover"
                />
            ) : (
                <Placeholder alt={alt} />
            )}
        </div>
    )
}