"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Car, Filter, Battery, Disc, Wind, Thermometer, Shield, Settings, Gauge, Zap, CircleDot, Lightbulb, Fuel, Package, HardHat, Lock, Sparkles, Camera, Briefcase, Wrench } from "lucide-react"

interface FastCategory {
  id: string
  name: string
  image: string
  icon: any
  description: string
}

const fastCategories: FastCategory[] = [
  {
    id: "filtre",
    name: "Filtres",
    image: "/fast categories/Filtre.png",
    icon: Filter,
    description: "Filtres à air, à huile, à carburant et à habitacle"
  },
  {
    id: "battery",
    name: "Batteries",
    image: "/fast categories/Battery.png",
    icon: Battery,
    description: "Batteries automobiles et accessoires"
  },
  {
    id: "brakes",
    name: "Freinage",
    image: "/fast categories/Brakes.webp",
    icon: Disc,
    description: "Plaquettes, disques et système de freinage"
  },
  {
    id: "air-conditioning",
    name: "Climatisation",
    image: "/fast categories/Air-conditioning.webp",
    icon: Wind,
    description: "Système de climatisation et ventilation"
  },
  {
    id: "engine",
    name: "Moteur",
    image: "/fast categories/Engine.webp",
    icon: Car,
    description: "Pièces moteur et accessoires"
  },
  {
    id: "steering",
    name: "Direction",
    image: "/fast categories/Steering.webp",
    icon: Settings,
    description: "Système de direction et guidage"
  },
  {
    id: "damping",
    name: "Suspension",
    image: "/fast categories/Damping.webp",
    icon: Gauge,
    description: "Amortisseurs et suspension"
  },
  {
    id: "interior",
    name: "Intérieur",
    image: "/fast categories/Interior.webp",
    icon: Package,
    description: "Équipement intérieur et confort"
  }
]

interface FastCategoriesSelectionProps {
  onCategorySelect?: (categoryId: string, categoryName: string) => void
}

export function FastCategoriesSelection({ onCategorySelect }: FastCategoriesSelectionProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const handleCategorySelect = (category: FastCategory) => {
    setSelectedCategory(category.id)
    
    // Store selected category in localStorage for the next page
    localStorage.setItem('selectedFastCategory', JSON.stringify({
      id: category.id,
      name: category.name,
      image: category.image,
      description: category.description
    }))
    
    // Navigate to vehicle selection page with category context
    router.push(`/category-vehicle-selection?category=${category.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          CATÉGORIES RAPIDES
        </h2>
        <p className="text-muted-foreground">
          Sélectionnez la catégorie de pièces que vous recherchez
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {fastCategories.map((category) => {
          const IconComponent = category.icon
          const isSelected = selectedCategory === category.id
          
          return (
            <Card
              key={category.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 ${
                isSelected 
                  ? 'border-primary shadow-lg scale-105' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => handleCategorySelect(category)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="text-center space-y-4">
                  {/* Category Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 rounded-lg"><svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div>`
                        }
                      }}
                    />
                  </div>

                  {/* Category Name */}
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-foreground group-hover:text-primary transition-colors mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {category.description}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8">
        <p className="text-sm text-muted-foreground">
          Après avoir sélectionné une catégorie, vous pourrez choisir votre véhicule pour voir les pièces disponibles
        </p>
      </div>
    </div>
  )
}
