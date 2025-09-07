import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

// CSS must be imported first - before any components
import "./output.css"
import "../styles/globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/hooks/use-cart"
import { CountryProvider } from "@/contexts/country-context"

export const metadata: Metadata = {
  title: "Pièces Auto Renault - Recherche de Pièces Automobiles",
  description: "Trouvez facilement les pièces automobiles Renault, Dacia et Nissan compatibles avec votre véhicule",
  generator: "v0.app",
  icons: {
    icon: "/LOGO Piece renault small.png",
    shortcut: "/LOGO Piece renault small.png",
    apple: "/LOGO Piece renault small.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/LOGO Piece renault small.png" type="image/png" />
        <link rel="shortcut icon" href="/LOGO Piece renault small.png" type="image/png" />
        <link rel="apple-touch-icon" href="/LOGO Piece renault small.png" />
      </head>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CountryProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </CountryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
