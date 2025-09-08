"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { VehicleSelector } from "@/components/vehicle-selector"
import ArticleSearch from "@/components/article-search"
import { ArticleDetails } from "@/components/article-details"
import { CartDrawer } from "@/components/cart-drawer"
import { ManufacturerSelection } from "@/components/manufacturer-selection"
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [showArticleDetails, setShowArticleDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle articleId from URL (from navbar search)
    const articleId = searchParams.get('articleId')
    const search = searchParams.get('search')
    
    if (articleId) {
      setSelectedArticleId(Number(articleId))
      setShowArticleDetails(true)
    } else if (search) {
      setSearchQuery(search)
      setShowArticleDetails(false)
      setSelectedArticleId(null)
    }
  }, [searchParams])

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticleId(articleId)
    setShowArticleDetails(true)
  }

  const handleBackToSearch = () => {
    setShowArticleDetails(false)
    setSelectedArticleId(null)
  }

  if (showArticleDetails && selectedArticleId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <ArticleDetails articleId={selectedArticleId} onBack={handleBackToSearch} />
          </div>
        </main>
        <CartDrawer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />

      {/* Banner Vidange - Home page only */}
      <div className="w-full">
        <img
          src="/BANNER VIDANGE.png"
          alt="Pack Vidange Voiture - Tout pour votre vidange facile"
          className="w-full h-auto object-cover"
        />
      </div>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          <VehicleSelector />

            {searchQuery && (
              <div className="mt-12">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    Résultats de recherche pour "{searchQuery}"
                  </h2>
                  <p className="text-muted-foreground">
                    Articles trouvés correspondant à votre recherche
                  </p>
                </div>
                <ArticleSearch 
                  initialSearchQuery={searchQuery}
                  onArticleSelect={handleArticleSelect}
                />
              </div>
            )}

            {!searchQuery && (
              <div className="space-y-12 mt-12">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">
                      Vous pouvez aussi rechercher directement par référence dans la barre de recherche ci-dessus
                    </span>
                  </div>
                </div>

                {/* Manufacturer Selection Section */}
                <div className="bg-gradient-to-br from-background to-muted/10 rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm">
                  <ManufacturerSelection onArticleSelect={handleArticleSelect} />
                </div>
              </div>
            )}
        </div>
      </main>

      {/* Service Features Section - DESKTOP ONLY (Static) */}
      <section className="bg-primary/5 border-t border-border/50 mt-16 hidden md:block lg:block xl:block">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Livraison Gratuite */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Livraison Gratuite</h3>
              <p className="text-sm text-muted-foreground">À partir de 100dt</p>
              <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion</p>
            </div>

            {/* Service Client */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Service Client</h3>
              <p className="text-sm text-muted-foreground">(+216) 99 639 619</p>
              <p className="text-sm text-muted-foreground">(+216) 20 639 610</p>
            </div>

            {/* 100% Sécurité */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">100% Sécurité</h3>
              <p className="text-sm text-muted-foreground">Paiement en ligne</p>
              <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible</p>
            </div>

            {/* Des Promotions */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Des Promotions</h3>
              <p className="text-sm text-muted-foreground">Offres spéciales</p>
              <p className="text-xs text-muted-foreground mt-1">Régulièrement mises à jour</p>
            </div>
          </div>
        </div>
      </section>

      {/* Service Features Section - MOBILE ONLY (Animated) */}
      <section className="bg-primary/5 border-t border-border/50 mt-16 block md:hidden lg:hidden xl:hidden">
        <div className="container mx-auto px-4 py-12">
          <div className="overflow-hidden">
            <div className="flex gap-6 mobile-scroll-animation">
              {/* First set of items */}
              {/* Livraison Gratuite */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Livraison Gratuite</h3>
                <p className="text-xs text-muted-foreground">À partir de 100dt</p>
                <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion</p>
              </div>

              {/* Service Client */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Service Client</h3>
                <p className="text-xs text-muted-foreground">(+216) 99 639 619</p>
                <p className="text-xs text-muted-foreground">(+216) 20 639 610</p>
              </div>

              {/* 100% Sécurité */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">100% Sécurité</h3>
                <p className="text-xs text-muted-foreground">Paiement en ligne</p>
                <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible</p>
              </div>

              {/* Des Promotions */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Des Promotions</h3>
                <p className="text-xs text-muted-foreground">Offres spéciales</p>
                <p className="text-xs text-muted-foreground mt-1">Régulièrement mises à jour</p>
              </div>

              {/* Duplicate set for seamless loop */}
              {/* Livraison Gratuite */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Livraison Gratuite</h3>
                <p className="text-xs text-muted-foreground">À partir de 100dt</p>
                <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion</p>
              </div>

              {/* Service Client */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Service Client</h3>
                <p className="text-xs text-muted-foreground">(+216) 99 639 619</p>
                <p className="text-xs text-muted-foreground">(+216) 20 639 610</p>
              </div>

              {/* 100% Sécurité */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">100% Sécurité</h3>
                <p className="text-xs text-muted-foreground">Paiement en ligne</p>
                <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible</p>
              </div>

              {/* Des Promotions */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Des Promotions</h3>
                <p className="text-xs text-muted-foreground">Offres spéciales</p>
                <p className="text-xs text-muted-foreground mt-1">Régulièrement mises à jour</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Suppliers Carousel Section */}
      <section className="bg-background border-t border-border/50 mt-8 overflow-hidden">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
              Nos Fournisseurs de Confiance
            </h2>
          </div>

          {/* Auto-scrolling suppliers */}
          <div className="overflow-hidden">
            <div className="flex gap-8 animate-suppliers-scroll">
              {/* First set of suppliers */}
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/BOSCH.jpg" alt="BOSCH" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/VALEO.jpg" alt="VALEO" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/RENAULT.jpg" alt="RENAULT" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/NISSAN.jpg" alt="NISSAN" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CASTROL.jpg" alt="CASTROL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/MOTUL.jpg" alt="MOTUL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SHELL.jpg" alt="SHELL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/TRW.jpg" alt="TRW" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SACHS.jpg" alt="SACHS" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/FEBI_BILSTEIN.jpg" alt="FEBI BILSTEIN" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/GATES.jpg" alt="GATES" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/NGK.jpg" alt="NGK" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CHAMPION.jpg" alt="CHAMPION" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SKF.jpg" alt="SKF" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CONTINENTAL.jpg" alt="CONTINENTAL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/MAHLE.jpg" alt="MAHLE" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/PIERBURG.jpg" alt="PIERBURG" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/VARTA.jpg" alt="VARTA" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/LIQUI_MOLY.jpg" alt="LIQUI MOLY" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/TOTAL.jpg" alt="TOTAL" className="max-w-full max-h-full object-contain" />
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/BOSCH.jpg" alt="BOSCH" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/VALEO.jpg" alt="VALEO" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/RENAULT.jpg" alt="RENAULT" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/NISSAN.jpg" alt="NISSAN" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CASTROL.jpg" alt="CASTROL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/MOTUL.jpg" alt="MOTUL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SHELL.jpg" alt="SHELL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/TRW.jpg" alt="TRW" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SACHS.jpg" alt="SACHS" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/FEBI_BILSTEIN.jpg" alt="FEBI BILSTEIN" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/GATES.jpg" alt="GATES" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/NGK.jpg" alt="NGK" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CHAMPION.jpg" alt="CHAMPION" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/SKF.jpg" alt="SKF" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/CONTINENTAL.jpg" alt="CONTINENTAL" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/MAHLE.jpg" alt="MAHLE" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/PIERBURG.jpg" alt="PIERBURG" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/VARTA.jpg" alt="VARTA" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/LIQUI_MOLY.jpg" alt="LIQUI MOLY" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 bg-white rounded-lg shadow-sm border border-border/50 flex items-center justify-center p-2 hover:shadow-md transition-shadow">
                <img src="/suppliers/TOTAL.jpg" alt="TOTAL" className="max-w-full max-h-full object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Information Section */}
      <section className="bg-background border-t border-border/50 mt-8">
        <div className="container mx-auto px-4 py-8">
          <Collapsible className="max-w-4xl mx-auto">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-border/50 hover:bg-primary/10 transition-colors group">
              <h2 className="text-xl font-semibold text-foreground">
                Achetez vos pièces auto en ligne sur PiecesAutoRenault.tn
              </h2>
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 p-6 bg-muted/20 rounded-lg border border-border/30">
              <div className="prose prose-sm max-w-none text-foreground space-y-6">
                <p className="text-base leading-relaxed">
                  Créée en 2007, la société Pieces Auto Renault s'est imposée comme l'un des leaders en Afrique dans le domaine de la vente de pièces automobiles. Nous proposons un large choix de pièces de qualité à prix compétitifs, pour répondre aux besoins des particuliers comme des professionnels.
                </p>
                
                <p className="text-base leading-relaxed">
                  Vous recherchez une pièce pour un modèle de voiture précis ? Besoin de pièces détachées neuves à prix discount ?
                  Grâce à notre catalogue complet, vous trouverez tout ce qu'il faut pour entretenir ou réparer votre véhicule : freins, filtres, suspension, embrayage, accessoires et bien plus encore.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">PIÈCES AUTO D'ORIGINE</h3>
                  <p className="text-base leading-relaxed">
                    Sur notre site, vous avez accès à des pièces d'origine équipementier pour les marques Renault, Nissan, Dacia, ainsi que de nombreux autres modèles.
                    Notre moteur de recherche interne vous permet de trouver la pièce exacte dont vous avez besoin :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                    <li>Recherche par marque, série, modèle et motorisation</li>
                    <li>Ou simplement par plaque d'immatriculation ou numéro de carte grise</li>
                  </ul>
                  <p className="text-base font-medium text-primary">
                    Trouver la bonne pièce auto n'aura jamais été aussi simple !
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">QUALITÉ ET SÉCURITÉ À DES PRIX IMBATTABLES</h3>
                  <p className="text-base leading-relaxed">
                    Nous travaillons avec les plus grands équipementiers mondiaux tels que Bosch, Valeo, Castrol, SKF, TRW, Luk, Contitech, et bien d'autres.
                    Toutes nos pièces respectent les standards européens de qualité et sécurité, et vous garantissent fiabilité et durabilité.
                  </p>
                  <p className="text-base leading-relaxed">
                    Grâce à nos partenariats directs, nous vous proposons régulièrement des promotions exclusives, avec des réductions pouvant aller jusqu'à -60% sur le tarif public. Acheter vos pièces sur PiecesAutoRenault.tn, c'est profiter du meilleur rapport qualité / prix.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">NOS ENGAGEMENTS DEPUIS 2007</h3>
                  <p className="text-base leading-relaxed">
                    Notre priorité a toujours été la satisfaction de nos clients.
                    C'est pourquoi nous vous assurons :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                    <li>Des milliers de références expédiées le jour même</li>
                    <li>Une livraison rapide en 24/48h à domicile ou en point relais</li>
                    <li>La livraison gratuite pour les professionnels de l'automobile</li>
                    <li>Un paiement sécurisé et flexible (CB, virement, CASH)</li>
                    <li>Un service client disponible 6j/7, prêt à vous accompagner dans vos choix.</li>
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 SPAR - Ste Pièces Auto Renault - Recherche professionnelle de pièces automobiles</p>
            <p className="mt-1">Propulsé par la base de données TecDoc</p>
          </div>
        </div>
      </footer>
      <CartDrawer />
    </div>
  )
}
