import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { CarritoProvider } from '@/lib/CarritoContext'
import Header from '@/components/Header'
import './globals.css'

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
    weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['400', '500', '600', '700'],
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: '#F5F0E8',
}

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    title: {
        default: "L'ESSENCE — Perfumes de nicho",
        template: "%s — L'ESSENCE",
    },
    description:
        'Perfumes de nicho seleccionados a mano. Una curaduría boutique para quienes buscan fragancias con carácter.',
    openGraph: {
        title: "L'ESSENCE — Perfumes de nicho",
        description:
            'Perfumes de nicho seleccionados a mano. Una curaduría boutique para quienes buscan fragancias con carácter.',
        type: 'website',
        locale: 'es_UY',
        siteName: "L'ESSENCE",
    },
    twitter: {
        card: 'summary_large_image',
        title: "L'ESSENCE — Perfumes de nicho",
        description:
            'Perfumes de nicho seleccionados a mano. Una curaduría boutique para quienes buscan fragancias con carácter.',
    },
}

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {
    return (
        <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
        <body>
        <CarritoProvider>
            <Header />
            {children}
        </CarritoProvider>
        </body>
        </html>
    )
}