import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

// CSS must be imported first - before any components
import "./output.css"
import "../styles/globals.css"

import { CartProvider } from "@/hooks/use-cart"
import { CountryProvider } from "@/contexts/country-context"
import { VehicleProvider } from "@/contexts/vehicle-context"
import { NotificationProvider } from "@/contexts/notification-context"
import { NotificationContainer } from "@/components/notification-container"
import { AuthSessionProvider } from "@/components/session-provider"
import { PerformanceMonitor } from "@/components/performance-monitor"
import { CriticalCSS } from "@/components/critical-css"

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#BE141E" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      // Force update to new service worker
                      registration.update();
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
              <body className={GeistSans.className}>
                <CriticalCSS />
                <PerformanceMonitor />
                <AuthSessionProvider>
                  <CountryProvider>
                    <VehicleProvider>
                      <CartProvider>
                        <NotificationProvider>
                          {children}
                          <NotificationContainer />
                        </NotificationProvider>
                      </CartProvider>
                    </VehicleProvider>
                  </CountryProvider>
                </AuthSessionProvider>
              </body>
    </html>
  )
}
