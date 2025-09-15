"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { ManufacturerSelection } from "@/components/manufacturer-selection"
import { ArrowLeft, Package } from "lucide-react"

interface FastCategory {
  id: string
  name: string
  image: string
  description: string
}

export default function CategoryVehicleSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<FastCategory | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get category from URL params or localStorage
    const categoryId = searchParams.get('category')
    
    if (categoryId) {
      // Try to get category info from localStorage
      const savedCategory = localStorage.getItem('selectedFastCategory')
      if (savedCategory) {
        try {
          const categoryData = JSON.parse(savedCategory)
          setSelectedCategory(categoryData)
        } catch (error) {
          console.error('Error parsing saved category:', error)
        }
      }
    }
    
    setLoading(false)
  }, [searchParams])

  const handleBackToHome = () => {
    // Clear saved category
    localStorage.removeItem('selectedFastCategory')
    router.push('/')
  }

  const handleArticleSelect = (articleId: number) => {
    // Navigate to article details
    router.push(`/?articleId=${articleId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <CartDrawer />
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-md mx-auto text-center py-20">
              <div className="bg-white rounded-2xl p-6 shadow-lg border" style={{ borderColor: "#D1B8B9" }}>
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#BE141E" }}
                >
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "#201A1A" }}>
                  Catégorie non trouvée
                </h2>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: "#B16C70" }}>
                  La catégorie sélectionnée n'a pas été trouvée. Veuillez retourner à l'accueil pour sélectionner une catégorie.
                </p>
                <button
                  onClick={handleBackToHome}
                  className="inline-flex items-center gap-2 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: "#BE141E" }}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Retour à l'accueil</span>
                </button>
              </div>
            </div>
          </div>
        </main>
        <CartDrawer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6" style={{ color: "#B16C70" }}>
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "#BE141E" }}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Accueil</span>
            </button>
            <span className="mx-2">•</span>
            <span className="font-medium" style={{ color: "#201A1A" }}>
              {selectedCategory.name}
            </span>
          </nav>

          {/* Category Info Header */}
          <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm border mb-8" style={{ borderColor: "#D1B8B9" }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder.svg'
                  }}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#201A1A" }}>
                  Pièces {selectedCategory.name}
                </h1>
                <p className="text-muted-foreground">
                  {selectedCategory.description}
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Étape suivante :</strong> Sélectionnez votre véhicule pour voir les pièces {selectedCategory.name.toLowerCase()} disponibles pour votre modèle.
              </p>
            </div>
          </div>

          {/* Vehicle Selection Section */}
          <div className="bg-gradient-to-br from-background to-muted/10 rounded-2xl p-6 sm:p-8 border border-border/50 shadow-sm">
            <ManufacturerSelection onArticleSelect={handleArticleSelect} />
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
    </div>
  )
}
