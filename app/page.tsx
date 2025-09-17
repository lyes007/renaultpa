"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"

// Lazy load all heavy components
const Header = dynamic(() => import("@/components/header").then(mod => ({ default: mod.Header })), { ssr: true })
const Footer = dynamic(() => import("@/components/footer").then(mod => ({ default: mod.Footer })), { ssr: false })
const VehicleSelector = dynamic(() => import("@/components/vehicle-selector").then(mod => ({ default: mod.VehicleSelector })), { ssr: false })
const ArticleSearch = dynamic(() => import("@/components/article-search"), { ssr: false })
const ArticleDetails = dynamic(() => import("@/components/article-details").then(mod => ({ default: mod.ArticleDetails })), { ssr: false })
const CartDrawer = dynamic(() => import("@/components/cart-drawer").then(mod => ({ default: mod.CartDrawer })), { ssr: false })
const ManufacturerSelection = dynamic(() => import("@/components/manufacturer-selection").then(mod => ({ default: mod.ManufacturerSelection })), { ssr: false })
const FastCategoriesSelection = dynamic(() => import("@/components/fast-categories-selection").then(mod => ({ default: mod.FastCategoriesSelection })), { ssr: false })

import { SaleSectionSkeleton } from "@/components/ui/loading-skeleton"

// Lazy load heavy components
const SaleSection = dynamic(() => import("@/components/sale-section-optimized").then(mod => ({ default: mod.SaleSection })), {
  loading: () => <SaleSectionSkeleton />,
  ssr: false
})
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown } from "lucide-react"
import "./categories/categories.css"

export default function HomePage() {
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null)
  const [showArticleDetails, setShowArticleDetails] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string | null>(null)
  const [wheelRotation, setWheelRotation] = useState(0)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Handle articleId from URL (from navbar search)
    const articleId = searchParams.get("articleId")
    const search = searchParams.get("search")

    if (articleId) {
      setSelectedArticleId(Number(articleId))
      setShowArticleDetails(true)
    } else if (search) {
      setSearchQuery(search)
      setShowArticleDetails(false)
      setSelectedArticleId(null)
    }
  }, [searchParams])

  // Wheel rotation on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const rotation = scrollY * 0.5 // Adjust rotation speed
      setWheelRotation(rotation)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

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


      {/* Hero Section - Modern Redesign */}
      <section className="relative w-full min-h-[600px] lg:min-h-[700px] overflow-hidden">
        {/* Background with custom color overlay */}
        <div className="absolute inset-0">
          {/* Mobile Background */}
          <div
            className="absolute inset-0 md:hidden"
            style={{
              backgroundImage: `url('/bg-mobile.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Desktop Background */}
          <div
            className="absolute inset-0 hidden md:block"
            style={{
              backgroundImage: `url('/bg-desktop.jpg')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          {/* Custom color overlay using provided palette */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, 
                rgba(32, 26, 26, 0.85) 0%, 
                rgba(190, 20, 30, 0.75) 50%, 
                rgba(32, 26, 26, 0.9) 100%)`,
            }}
          />
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-4 h-full min-h-[600px] lg:min-h-[700px]">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full items-center py-8 lg:py-12">
            {/* Left Side - Vehicle Selector - Compact */}
            <div className="w-full lg:w-1/4 order-2 lg:order-1">
              <div className="max-w-xs mx-auto lg:max-w-none">
                <VehicleSelector />
              </div>
            </div>

            {/* Right Side - Hero Content - Takes more space */}
            <div className="w-full lg:w-3/4 order-1 lg:order-2 text-center lg:text-left">
              <div className="w-full">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#BE141E" }} />
                  <span className="text-sm font-medium text-white/90">Leader depuis 2007</span>
                </div>

                {/* Main Title */}
                <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
                  <span className="text-white">Pièces Automobiles</span>
                  <br />
                  <span className="text-white">
                    Renault Premium
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="hero-slogan text-lg sm:text-xl lg:text-2xl text-white mb-8 leading-relaxed">
                  Excellence Automobile • Performance Garantie • Service Professionnel
                  <br />
                  <span className="text-base text-white">
                    Des milliers de pièces d'origine et de qualité équipementier pour Renault, Dacia & Nissan
                  </span>
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-white font-medium">Livraison 24/48h</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-white font-medium">Qualité garantie</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <span className="text-sm text-white font-medium">Prix compétitifs</span>
                  </div>
                </div>

                {/* CTA Section */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <button 
                    style={{
                      fontWeight: "bold",
                      letterSpacing: "0.1em",
                      border: "none",
                      borderRadius: "1.1em",
                      backgroundColor: "#BE141E",
                      cursor: "pointer",
                      color: "white",
                      padding: "1em 2em",
                      transition: "box-shadow ease-in-out 0.3s, background-color ease-in-out 0.1s, letter-spacing ease-in-out 0.1s, transform ease-in-out 0.1s",
                      boxShadow: "8px 8px 6px rgba(28, 28, 28, 0.3), -8px -8px 6px rgba(38, 38, 38, 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "10px 10px 8px rgba(18, 18, 18, 0.4), -10px -10px 8px rgba(48, 48, 48, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "8px 8px 6px rgba(28, 28, 28, 0.3), -8px -8px 6px rgba(38, 38, 38, 0.2)";
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.boxShadow = "10px 10px 8px rgba(18, 18, 18, 0.4), -10px -10px 8px rgba(48, 48, 48, 0.3), #BE141E 0px 0px 20px 3px";
                      e.currentTarget.style.backgroundColor = "#BE141E";
                      e.currentTarget.style.transform = "scale(0.95)";
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.boxShadow = "10px 10px 8px rgba(18, 18, 18, 0.4), -10px -10px 8px rgba(48, 48, 48, 0.3)";
                      e.currentTarget.style.backgroundColor = "#BE141E";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Découvrir nos catalogues
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background/50 to-transparent pointer-events-none" />

        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-white/5 backdrop-blur-sm animate-pulse hidden lg:block" />
        <div
          className="absolute bottom-32 left-10 w-16 h-16 rounded-full bg-white/5 backdrop-blur-sm animate-pulse hidden lg:block"
          style={{ animationDelay: "1s" }}
        />
      </section>

      <main className="container mx-auto px-4 py-6 sm:py-8 relative">
        <div className="max-w-6xl mx-auto">
          {searchQuery && (
            <div className="mt-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Résultats de recherche pour "{searchQuery}"
                </h2>
                <p className="text-muted-foreground">Articles trouvés correspondant à votre recherche</p>
              </div>
              <ArticleSearch initialSearchQuery={searchQuery} onArticleSelect={handleArticleSelect} />
            </div>
          )}

          {!searchQuery && (
            <div className="space-y-12 mt-12">
              {/* Fast Categories Selection Section */}
              <div className="bg-gradient-to-br from-background to-muted/10 rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm">
                <FastCategoriesSelection />
              </div>

              {/* Sale Section */}
              <div className="bg-gradient-to-br from-background to-muted/10 rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <SaleSection />
              </div>
            </div>
          )}
        </div>

        {/* Wheel Image - Half visible on the far right of the page */}
        <div className="absolute top-20 right-0 overflow-hidden -z-10">
          <img
            src="/wheel.png"
            alt="Performance Wheel"
            className="h-64 md:h-80 lg:h-96 xl:h-[28rem] w-auto object-contain opacity-80 wheel-scroll-rotate"
            style={{
              transform: `translateX(50%) rotate(${wheelRotation}deg)`,
              transition: "transform 0.1s ease-out",
            }}
          />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Livraison Gratuite Express</h3>
              <p className="text-sm text-muted-foreground">À partir de 100dt d'achat</p>
              <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion spéciale</p>
            </div>

            {/* Service Client */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Service Client Expert</h3>
              <p className="text-sm text-muted-foreground">Assistance téléphonique</p>
              <p className="text-sm text-muted-foreground">(+216) 99 639 619</p>
              <p className="text-sm text-muted-foreground">(+216) 20 639 610</p>
            </div>

            {/* 100% Sécurité */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">100% Sécurité Garantie</h3>
              <p className="text-sm text-muted-foreground">Paiement en ligne sécurisé</p>
              <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible sur notre site</p>
            </div>

            {/* Des Promotions */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Promotions Exclusives</h3>
              <p className="text-sm text-muted-foreground">Offres spéciales régulières</p>
              <p className="text-xs text-muted-foreground mt-1">Jusqu'à -60% sur certains articles</p>
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
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Livraison Gratuite Express</h3>
                <p className="text-xs text-muted-foreground">À partir de 100dt d'achat</p>
                <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion spéciale</p>
              </div>

              {/* Service Client */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Service Client Expert</h3>
                <p className="text-xs text-muted-foreground">Assistance téléphonique</p>
                <p className="text-xs text-muted-foreground">(+216) 99 639 619</p>
                <p className="text-xs text-muted-foreground">(+216) 20 639 610</p>
              </div>

              {/* 100% Sécurité */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">100% Sécurité Garantie</h3>
                <p className="text-xs text-muted-foreground">Paiement en ligne sécurisé</p>
                <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible sur notre site</p>
              </div>

              {/* Des Promotions */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Promotions Exclusives</h3>
                <p className="text-xs text-muted-foreground">Offres spéciales régulières</p>
                <p className="text-xs text-muted-foreground mt-1">Jusqu'à -60% sur certains articles</p>
              </div>

              {/* Duplicate set for seamless loop */}
              {/* Livraison Gratuite */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Livraison Gratuite Express</h3>
                <p className="text-xs text-muted-foreground">À partir de 100dt d'achat</p>
                <p className="text-xs text-muted-foreground mt-1">*Sauf articles en promotion spéciale</p>
              </div>

              {/* Service Client */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Service Client Expert</h3>
                <p className="text-xs text-muted-foreground">Assistance téléphonique</p>
                <p className="text-xs text-muted-foreground">(+216) 99 639 619</p>
                <p className="text-xs text-muted-foreground">(+216) 20 639 610</p>
              </div>

              {/* 100% Sécurité */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">100% Sécurité Garantie</h3>
                <p className="text-xs text-muted-foreground">Paiement en ligne sécurisé</p>
                <p className="text-xs text-muted-foreground mt-1">*Bientôt disponible sur notre site</p>
              </div>

              {/* Des Promotions */}
              <div className="text-center group flex-shrink-0 w-48">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">Promotions Exclusives</h3>
                <p className="text-xs text-muted-foreground">Offres spéciales régulières</p>
                <p className="text-xs text-muted-foreground mt-1">Jusqu'à -60% sur certains articles</p>
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
              Nos Fournisseurs de Confiance Automobile
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Partenaires officiels des plus grandes marques d'équipementiers automobiles mondiaux
            </p>
          </div>

          {/* Auto-scrolling suppliers */}
          <div className="overflow-hidden">
            <div className="flex gap-8 animate-suppliers-scroll">
              {/* First set of suppliers */}
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/BOSCH.jpg" alt="BOSCH" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/VALEO.jpg" alt="VALEO" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CASTROL.jpg" alt="CASTROL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/MOTUL.jpg" alt="MOTUL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SHELL.jpg" alt="SHELL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/TRW.jpg" alt="TRW" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SACHS.jpg" alt="SACHS" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/FEBI_BILSTEIN.jpg" alt="FEBI BILSTEIN" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/GATES.jpg" alt="GATES" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/NGK.jpg" alt="NGK" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CHAMPION.jpg" alt="CHAMPION" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SKF.jpg" alt="SKF" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CONTINENTAL.jpg" alt="CONTINENTAL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/MAHLE.jpg" alt="MAHLE" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/PIERBURG.jpg" alt="PIERBURG" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/VARTA.jpg" alt="VARTA" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/LIQUI_MOLY.jpg" alt="LIQUI MOLY" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/TOTAL.jpg" alt="TOTAL" className="w-full h-full object-cover" />
              </div>

              {/* Duplicate set for seamless loop */}
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/BOSCH.jpg" alt="BOSCH" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/VALEO.jpg" alt="VALEO" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CASTROL.jpg" alt="CASTROL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/MOTUL.jpg" alt="MOTUL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SHELL.jpg" alt="SHELL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/TRW.jpg" alt="TRW" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SACHS.jpg" alt="SACHS" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/FEBI_BILSTEIN.jpg" alt="FEBI BILSTEIN" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/GATES.jpg" alt="GATES" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/NGK.jpg" alt="NGK" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CHAMPION.jpg" alt="CHAMPION" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/SKF.jpg" alt="SKF" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/CONTINENTAL.jpg" alt="CONTINENTAL" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/MAHLE.jpg" alt="MAHLE" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/PIERBURG.jpg" alt="PIERBURG" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/VARTA.jpg" alt="VARTA" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/LIQUI_MOLY.jpg" alt="LIQUI MOLY" className="w-full h-full object-cover" />
              </div>
              <div className="flex-shrink-0 w-24 h-16 flex items-center justify-center hover:opacity-80 transition-opacity px-1">
                <img src="/suppliers/TOTAL.jpg" alt="TOTAL" className="w-full h-full object-cover" />
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
                Achetez vos pièces automobiles en ligne sur PiecesAutoRenault.tn - Votre spécialiste depuis 2007
              </h2>
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-all duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 p-6 bg-muted/20 rounded-lg border border-border/30">
              <div className="prose prose-sm max-w-none text-foreground space-y-6">
                <p className="text-base leading-relaxed">
                  Créée en 2007, la société Pieces Auto Renault s'est imposée comme l'un des leaders incontournables en
                  Afrique dans le domaine de la vente de pièces automobiles de qualité. Nous proposons un large choix de
                  pièces détachées authentiques à prix compétitifs, pour répondre efficacement aux besoins des
                  particuliers comme des professionnels de l'automobile.
                </p>

                <p className="text-base leading-relaxed">
                  Vous recherchez une pièce automobile spécifique pour un modèle de voiture précis ? Besoin de pièces
                  détachées neuves d'origine à prix discount avantageux ? Grâce à notre catalogue complet et
                  régulièrement mis à jour, vous trouverez tout ce qu'il faut pour entretenir ou réparer votre véhicule
                  en toute confiance : systèmes de freinage, filtres haute performance, suspension, embrayage,
                  accessoires automobiles et bien plus encore.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    PIÈCES AUTOMOBILES D'ORIGINE ET ÉQUIPEMENTIER
                  </h3>
                  <p className="text-base leading-relaxed">
                    Sur notre site spécialisé, vous avez accès à des pièces d'origine constructeur et équipementier de
                    première qualité pour les marques Renault, Nissan, Dacia, ainsi que de nombreux autres modèles
                    automobiles. Notre moteur de recherche interne avancé vous permet de trouver rapidement et
                    précisément la pièce exacte dont vous avez besoin :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                    <li>Recherche détaillée par marque, série, modèle et motorisation spécifique</li>
                    <li>Ou simplement par plaque d'immatriculation ou numéro de carte grise pour plus de simplicité</li>
                    <li>Filtrage par année de fabrication et type de carburant</li>
                    <li>Recherche par référence constructeur ou équipementier</li>
                  </ul>
                  <p className="text-base font-medium text-primary">
                    Trouver la bonne pièce automobile compatible avec votre véhicule n'aura jamais été aussi simple et
                    rapide !
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">
                    QUALITÉ PREMIUM ET SÉCURITÉ AUTOMOBILE À DES PRIX IMBATTABLES
                  </h3>
                  <p className="text-base leading-relaxed">
                    Nous travaillons exclusivement avec les plus grands équipementiers automobiles mondiaux reconnus
                    tels que Bosch, Valeo, Castrol, SKF, TRW, Luk, Contitech, Gates, NGK, Champion, Continental, Mahle,
                    et bien d'autres marques de référence. Toutes nos pièces automobiles respectent scrupuleusement les
                    standards européens de qualité et sécurité les plus stricts, et vous garantissent une fiabilité
                    optimale et une durabilité exceptionnelle.
                  </p>
                  <p className="text-base leading-relaxed">
                    Grâce à nos partenariats directs privilégiés avec les fabricants, nous vous proposons régulièrement
                    des promotions exclusives exceptionnelles, avec des réductions substantielles pouvant aller jusqu'à
                    -60% sur le tarif public constructeur. Acheter vos pièces automobiles sur PiecesAutoRenault.tn,
                    c'est profiter du meilleur rapport qualité-prix du marché automobile tunisien.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">NOS ENGAGEMENTS QUALITÉ DEPUIS 2007</h3>
                  <p className="text-base leading-relaxed">
                    Notre priorité absolue a toujours été la satisfaction complète de nos clients et la qualité de notre
                    service. C'est pourquoi nous vous assurons :
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4 text-base">
                    <li>Des milliers de références automobiles en stock expédiées le jour même de votre commande</li>
                    <li>Une livraison rapide et sécurisée en 24/48h à domicile ou en point relais partenaire</li>
                    <li>La livraison gratuite express pour les professionnels de l'automobile et garagistes</li>
                    <li>Un paiement 100% sécurisé et flexible (CB, virement bancaire, paiement CASH à la livraison)</li>
                    <li>
                      Un service client expert disponible 6j/7, prêt à vous accompagner et conseiller dans vos choix
                      techniques.
                    </li>
                    <li>Une garantie constructeur sur toutes nos pièces automobiles d'origine</li>
                    <li>Un service après-vente réactif et professionnel</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary mb-3">EXPERTISE AUTOMOBILE ET CONSEIL TECHNIQUE</h3>
                  <p className="text-base leading-relaxed">
                    Fort de plus de 15 années d'expérience dans le secteur automobile, notre équipe d'experts techniques
                    vous accompagne dans le choix de vos pièces automobiles. Nous vous proposons des conseils
                    personnalisés pour vous assurer de la compatibilité parfaite avec votre véhicule et vous garantir
                    une installation optimale.
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      <Footer />
      <CartDrawer />
    </div>
  )
}
