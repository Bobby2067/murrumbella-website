import type React from "react"
import type { Metadata, Viewport } from "next"
import { Playfair_Display, Montserrat, Cormorant_Garamond, DM_Sans } from "next/font/google"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
})

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600"],
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})

const dmSans = DM_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dmsans",
  weight: ["300", "400", "500"],
})

export const metadata: Metadata = {
  title: "Murrumbella — 406 Acres on the Murrumbidgee River",
  description:
    "A 406-acre property on the Murrumbidgee River, NSW Australia. Rural zoning with full building entitlement. Offered for private sale by expression of interest.",
  openGraph: {
    siteName: "Murrumbella",
    title: "Murrumbella — 406 Acres on the Murrumbidgee River",
    description:
      "A rare opportunity to acquire 406 acres of pristine river frontage on the Murrumbidgee River, NSW Australia.",
    type: "website",
    locale: "en_AU",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#3E3E3E",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable} ${cormorant.variable} ${dmSans.variable} antialiased`}>
      <body className="font-sans bg-[var(--murrumbella-cream)] text-[var(--charcoal-ridge)] overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
