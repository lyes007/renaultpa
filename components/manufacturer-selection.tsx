"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Car, ArrowRight, Grid3x3, ChevronLeft, ChevronRight, X, Search } from "lucide-react"
import { getManufacturers, getModels, getVehicles, getCategories } from "@/lib/apify-api"
import { getManufacturerLogo } from "@/lib/car-logos"
import { getModelImageUrl, getModelDisplayName } from "@/lib/model-image-utils"
import { useCountry } from "@/contexts/country-context"
import { ModernArticlesList } from "./modern-articles-list"
import { HierarchicalCategories } from "./hierarchical-categories"

interface Manufacturer {
  manufacturerId: number
  brand: string
}

interface Model {
  modelId: number
  modelName: string
  modelYearFrom: string
  modelYearTo: string
}

interface Vehicle {
  vehicleId: number
  manufacturerName: string
  modelName: string
  typeEngineName: string
  powerKw: string
  powerPs: string
  fuelType: string
  bodyType: string
  constructionIntervalStart: string
  constructionIntervalEnd: string | null
}

interface ManufacturerSelectionProps {
  onArticleSelect?: (articleId: number) => void
}

export function ManufacturerSelection({ onArticleSelect }: ManufacturerSelectionProps) {
  const { selectedCountry } = useCountry()
  
  // Selection states
  const [selectedManufacturer, setSelectedManufacturer] = useState<Manufacturer | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  // Data states
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  
  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  
  // UI states
  const [currentStep, setCurrentStep] = useState<'manufacturers' | 'models' | 'categories' | 'articles'>('manufacturers')
  const [error, setError] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null)
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Pagination and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const modelsPerPage = 12 // Show 12 models per page

  // Filtered and paginated models
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return models
    
    return models.filter(model => 
      getModelDisplayName(model.modelName).toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [models, searchQuery])

  const paginatedModels = useMemo(() => {
    const startIndex = (currentPage - 1) * modelsPerPage
    const endIndex = startIndex + modelsPerPage
    return filteredModels.slice(startIndex, endIndex)
  }, [filteredModels, currentPage, modelsPerPage])

  const totalPages = Math.ceil(filteredModels.length / modelsPerPage)

  // Reset pagination when search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Load manufacturers on mount
  useEffect(() => {
    loadManufacturers()
  }, [selectedCountry.id])

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVehicleDropdown(false)
      }
    }

    if (showVehicleDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVehicleDropdown])

  const loadManufacturers = async () => {
    try {
      setLoadingManufacturers(true)
      setError(null)
      const response = await getManufacturers(selectedCountry.id)

      if (response.error) {
        setError(response.error)
        return
      }

      const manufacturersData = (response.data as any)?.[0]?.manufacturers || []
      
      // Filter to only show Renault, Dacia, and Nissan
      const allowedBrands = ['RENAULT', 'DACIA', 'NISSAN']
      const filteredManufacturers = manufacturersData.filter((manufacturer: Manufacturer) => 
        allowedBrands.includes(manufacturer.brand.toUpperCase())
      )
      
      setManufacturers(filteredManufacturers)
    } catch (err) {
      setError("Erreur lors du chargement des marques")
      console.error("Error loading manufacturers:", err)
    } finally {
      setLoadingManufacturers(false)
    }
  }

  const loadModels = async (manufacturerId: number) => {
    try {
      setLoadingModels(true)
      setError(null)
      const response = await getModels(manufacturerId, selectedCountry.id)

      if (response.error) {
        setError(response.error)
        return
      }

      const modelsData = (response.data as any)?.[0]?.models || []
      setModels(modelsData)
    } catch (err) {
      setError("Erreur lors du chargement des modèles")
      console.error("Error loading models:", err)
    } finally {
      setLoadingModels(false)
    }
  }

  const loadVehicles = async (manufacturerId: number, modelId: number) => {
    try {
      setLoadingVehicles(true)
      setError(null)
      const response = await getVehicles(manufacturerId, modelId, selectedCountry.id)

      if (response.error) {
        setError(response.error)
        return
      }

      const responseData = (response.data as any)?.[0]
      console.log("[v0] Vehicle response data:", responseData)
      
      // Extract vehicles from modelTypes array
      const vehiclesData = responseData?.modelTypes || []
      console.log("[v0] Extracted vehicles:", vehiclesData)
      setVehicles(vehiclesData)
    } catch (err) {
      setError("Erreur lors du chargement des motorisations")
      console.error("Error loading vehicles:", err)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleManufacturerSelect = (manufacturer: Manufacturer) => {
    setSelectedManufacturer(manufacturer)
    setSelectedModel(null)
    setSelectedVehicle(null)
    setCurrentStep('models')
    loadModels(manufacturer.manufacturerId)
  }

  const handleModelSelect = (model: Model) => {
    if (selectedModel?.modelId === model.modelId && showVehicleDropdown) {
      // If same model is clicked and dropdown is open, close it
      setShowVehicleDropdown(false)
      setSelectedModel(null)
    } else {
      // Select new model and show dropdown
      setSelectedModel(model)
      setSelectedVehicle(null)
      setShowVehicleDropdown(true)
      if (selectedManufacturer) {
        loadVehicles(selectedManufacturer.manufacturerId, model.modelId)
      }
    }
  }

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowVehicleDropdown(false)
    setCurrentStep('categories')
  }

  const handleBackToStep = (step: 'manufacturers' | 'models') => {
    setCurrentStep(step)
    if (step === 'manufacturers') {
      setSelectedManufacturer(null)
      setSelectedModel(null)
      setSelectedVehicle(null)
      setSelectedCategoryId(null)
      setSelectedCategoryName(null)
      setShowVehicleDropdown(false)
      setSearchQuery('')
      setCurrentPage(1)
    } else if (step === 'models') {
      setSelectedModel(null)
      setSelectedVehicle(null)
      setSelectedCategoryId(null)
      setSelectedCategoryName(null)
      setShowVehicleDropdown(false)
    }
  }

  const getLocalManufacturerLogo = (brand: string) => {
    const brandUpper = brand.toUpperCase()
    switch (brandUpper) {
      case 'DACIA':
        return '/dacia-logo.png'
      case 'RENAULT':
        return '/renault-logo.png'
      case 'NISSAN':
        return '/nissan-logo.png'
      default:
        return '/placeholder.svg'
    }
  }


  const renderManufacturers = () => (
    <div className="space-y-6">
      <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            NOS MARQUES DISPONIBLES
          </h2>
        <p className="text-muted-foreground">
          Sélectionnez la marque de votre véhicule pour commencer
        </p>
      </div>

      {loadingManufacturers ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        ) : (
          <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm border border-border/30 max-w-3xl mx-auto">
            <div className="flex items-center justify-between sm:px-8">
              {manufacturers.map((manufacturer) => (
                <div
                  key={manufacturer.manufacturerId}
                  className="group cursor-pointer transition-all duration-300 hover:scale-110 flex-1 flex justify-center"
                  onClick={() => handleManufacturerSelect(manufacturer)}
                >
                  <div className="w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                    <img
                      src={getLocalManufacturerLogo(manufacturer.brand)}
                      alt={`${manufacturer.brand} logo`}
                      className="w-full h-full object-contain filter group-hover:brightness-110 transition-all duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
      )}
    </div>
  )

  const renderModels = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBackToStep('manufacturers')}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Modèles {selectedManufacturer?.brand}
          </h2>
          <p className="text-muted-foreground text-sm">
            {filteredModels.length} modèle{filteredModels.length > 1 ? 's' : ''} disponible{filteredModels.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un modèle..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {loadingModels ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? `Aucun modèle trouvé pour "${searchQuery}"` : 'Aucun modèle disponible'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
            {paginatedModels.map((model) => (
            <div key={model.modelId} className="relative">
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.02] border ${
                  selectedModel?.modelId === model.modelId 
                    ? 'border-primary shadow-md scale-[1.02]' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleModelSelect(model)}
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] sm:aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
                    <img
                      src={getModelImageUrl(selectedManufacturer?.brand || '', model.modelName)}
                      alt={`${selectedManufacturer?.brand} ${model.modelName}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = '/placeholder.svg'
                      }}
                    />
                  </div>
                  <div className="p-2 sm:p-3">
                    <h3 className="font-medium text-sm sm:text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 mb-1">
                      {getModelDisplayName(model.modelName)}
                    </h3>
                    <div className="flex items-center gap-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                        {model.modelYearFrom}
                      </Badge>
                      {model.modelYearTo && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          {model.modelYearTo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motorization Dropdown */}
              {selectedModel?.modelId === model.modelId && showVehicleDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-2 bg-background border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto"
                >
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Motorisations {getModelDisplayName(model.modelName)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Choisissez la motorisation correspondant à votre véhicule
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowVehicleDropdown(false)
                          setSelectedModel(null)
                        }}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    {loadingVehicles ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : vehicles.length > 0 ? (
                      <div className="space-y-2">
                        {vehicles.map((vehicle) => (
                          <div
                            key={vehicle.vehicleId}
                            className="p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all duration-200 group"
                            onClick={() => handleVehicleSelect(vehicle)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Car className="h-4 w-4 text-primary" />
                                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                                    {vehicle.typeEngineName}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  <Badge variant="outline" className="text-xs">
                                    {vehicle.powerPs} HP
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {vehicle.powerKw} kW
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {vehicle.fuelType}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {vehicle.constructionIntervalStart}{vehicle.constructionIntervalEnd ? `-${vehicle.constructionIntervalEnd}` : ''}
                                  </Badge>
                                </div>
                              </div>
                              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors ml-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          Aucune motorisation trouvée pour ce modèle
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0 text-xs"
                    >
                      {page}
                    </Button>
                  )
                } else if (
                  page === currentPage - 2 ||
                  page === currentPage + 2
                ) {
                  return <span key={page} className="text-muted-foreground">...</span>
                }
                return null
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
      )}
    </div>
  )


  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBackToStep('models')}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour aux modèles
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Catégories de pièces
          </h2>
          <p className="text-muted-foreground text-sm">
            {selectedManufacturer?.brand} {getModelDisplayName(selectedModel?.modelName || '')} - {selectedVehicle?.typeEngineName}
          </p>
        </div>
      </div>

      {selectedManufacturer && selectedVehicle && (
        <HierarchicalCategories
          manufacturerId={selectedManufacturer.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          onCategorySelect={(categoryId, categoryName) => {
            setSelectedCategoryId(categoryId)
            setSelectedCategoryName(categoryName)
            setCurrentStep('articles')
          }}
        />
      )}
    </div>
  )

  const renderArticles = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentStep('categories')}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Retour aux catégories
        </Button>
        <div className="text-center flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Articles disponibles
          </h2>
          <p className="text-muted-foreground text-sm">
            {selectedManufacturer?.brand} {getModelDisplayName(selectedModel?.modelName || '')} - {selectedVehicle?.typeEngineName}
          </p>
        </div>
      </div>

      {selectedManufacturer && selectedVehicle && selectedCategoryId && (
        <ModernArticlesList
          manufacturerId={selectedManufacturer.manufacturerId}
          vehicleId={selectedVehicle.vehicleId}
          productGroupId={selectedCategoryId}
          categoryName={selectedCategoryName || "Articles"}
          onArticleSelect={onArticleSelect}
        />
      )}
    </div>
  )

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {currentStep === 'manufacturers' && renderManufacturers()}
      {currentStep === 'models' && renderModels()}
      {currentStep === 'categories' && renderCategories()}
      {currentStep === 'articles' && renderArticles()}
    </div>
  )
}
