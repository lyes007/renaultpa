"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SimpleSelect } from "@/components/ui/simple-select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Car, Calendar, Fuel, CheckCircle, Search } from "lucide-react"
import { getManufacturers, getModels, getVehicles } from "@/lib/apify-api"
import { searchCarImages } from "@/lib/wikimedia-api"
import { getManufacturerLogo } from "@/lib/car-logos"
import { useCountry } from "@/contexts/country-context"
import { HierarchicalCategories } from "./hierarchical-categories"
import { ModernArticlesList } from "./modern-articles-list"
import { ArticleDetails } from "./article-details"
import { VinSelector } from "./vin-selector"
import { CustomToggle } from "./ui/custom-toggle"

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
  typeEngineName: string
  powerPs: number
  powerKw: number
  fuelType: string
}

interface VinVehicle {
  manuId: number
  carId: number
  carName: string
  modelId: number
  vehicleTypeDescription: string
}

export function VehicleSelector() {
  const { selectedCountry } = useCountry()
  
  // Toggle state - false = VIN search, true = manual search
  const [isManualMode, setIsManualMode] = useState(false)
  
  // Manual selection states
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedBrand, setSelectedBrand] = useState<Manufacturer | null>(null)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  
  // VIN selection state
  const [vinVehicle, setVinVehicle] = useState<VinVehicle | null>(null)
  
  // Common states
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null)
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null)

  const [loadingManufacturers, setLoadingManufacturers] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [loadingCarImage, setLoadingCarImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [carImage, setCarImage] = useState<string | null>(null)

  // Load manufacturers on component mount
  useEffect(() => {
    const loadManufacturers = async () => {
      try {
        setLoadingManufacturers(true)
        const data = await getManufacturers(selectedCountry)
        setManufacturers(data)
      } catch (err) {
        console.error("Error loading manufacturers:", err)
        setError("Erreur lors du chargement des marques")
      } finally {
        setLoadingManufacturers(false)
      }
    }

    loadManufacturers()
  }, [selectedCountry])

  // Load models when brand is selected
  useEffect(() => {
    if (!selectedBrand) {
      setModels([])
      setSelectedModel(null)
      setVehicles([])
      setSelectedVehicle(null)
      return
    }

    const loadModels = async () => {
      try {
        setLoadingModels(true)
        setError(null)
        const data = await getModels(selectedBrand.manufacturerId, selectedCountry)
        setModels(data)
        setSelectedModel(null)
        setVehicles([])
        setSelectedVehicle(null)
      } catch (err) {
        console.error("Error loading models:", err)
        setError("Erreur lors du chargement des modèles")
      } finally {
        setLoadingModels(false)
      }
    }

    loadModels()
  }, [selectedBrand, selectedCountry])

  // Load vehicles when model is selected
  useEffect(() => {
    if (!selectedModel) {
      setVehicles([])
      setSelectedVehicle(null)
      return
    }

    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true)
        setError(null)
        const data = await getVehicles(selectedModel.modelId, selectedCountry)
        setVehicles(data)
        setSelectedVehicle(null)
      } catch (err) {
        console.error("Error loading vehicles:", err)
        setError("Erreur lors du chargement des motorisations")
      } finally {
        setLoadingVehicles(false)
      }
    }

    loadVehicles()
  }, [selectedModel, selectedCountry])

  // Load car image when vehicle is selected
  useEffect(() => {
    if (!selectedVehicle || !selectedBrand) return

    const brandName = selectedBrand.brand
    const modelName = selectedModel?.modelName || ""
    loadCarImage(brandName, modelName)
  }, [selectedVehicle, selectedBrand, selectedModel])

  const loadCarImage = async (brandName: string, modelName: string) => {
    try {
      setLoadingCarImage(true)
      const imageUrl = await searchCarImages(brandName, modelName)
      setCarImage(imageUrl)
    } catch (err) {
      console.error("Error loading car image:", err)
      setCarImage(null)
    } finally {
      setLoadingCarImage(false)
    }
  }

  const handleBrandChange = (value: string) => {
    const brand = manufacturers.find(m => m.manufacturerId.toString() === value)
    setSelectedBrand(brand || null)
    setSelectedCategory(null)
    setSelectedArticle(null)
    setCarImage(null)
  }

  const handleModelChange = (value: string) => {
    const model = models.find(m => m.modelId.toString() === value)
    setSelectedModel(model || null)
    setSelectedCategory(null)
    setSelectedArticle(null)
    setCarImage(null)
  }

  const handleVehicleChange = (value: string) => {
    const vehicle = vehicles.find(v => v.vehicleId.toString() === value)
    setSelectedVehicle(vehicle || null)
    setSelectedCategory(null)
    setSelectedArticle(null)
  }

  const handleCategorySelect = (category: { id: string; name: string }) => {
    setSelectedCategory(category)
    setSelectedArticle(null)
  }

  const handleArticleSelect = (articleId: number) => {
    setSelectedArticle(articleId)
  }

  const handleBackFromArticle = () => {
    setSelectedArticle(null)
  }

  const handleVinVehicleSelect = (vehicle: VinVehicle) => {
    console.log("[VIN] Vehicle selected:", vehicle)
    setVinVehicle(vehicle)
    setSelectedCategory(null)
    setSelectedArticle(null)
    setCarImage(null)
    
    // Load car image for VIN vehicle
    const brandName = vehicle.carName.split(' ')[0] // Extract brand from carName (e.g., "VW" from "VW TIGUAN...")
    const modelName = vehicle.carName.split(' ').slice(1, 3).join(' ') // Extract model name
    loadCarImage(brandName, modelName)
  }

  const handleToggleChange = (checked: boolean) => {
    setIsManualMode(checked)
    // Reset all selections when switching modes
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedVehicle(null)
    setVinVehicle(null)
    setSelectedCategory(null)
    setSelectedArticle(null)
    setCarImage(null)
    setModels([])
    setVehicles([])
  }

  // Format data for SimpleSelect components
  const formatManufacturersOptions = () => {
    const options = manufacturers.map(manufacturer => ({
      value: manufacturer.manufacturerId.toString(),
      label: manufacturer.brand,
      sublabel: ""
    }))
    return options
  }

  const formatModelsOptions = () => {
    return models.map(model => ({
      value: model.modelId.toString(),
      label: model.modelName,
      sublabel: `${model.modelYearFrom ? model.modelYearFrom.split("-")[0] : "N/A"} - ${model.modelYearTo ? model.modelYearTo.split("-")[0] : "présent"}`
    }))
  }

  const formatVehiclesOptions = () => {
    return vehicles.map(vehicle => ({
      value: vehicle.vehicleId.toString(),
      label: vehicle.typeEngineName,
      sublabel: `${vehicle.powerPs}ch (${vehicle.powerKw}kW) • ${vehicle.fuelType}`
    }))
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center mb-8 animate-in fade-in duration-700">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-4">
          Trouvez vos Pièces Auto
        </h1>
      </div>

      {/* Vehicle Selection Card */}
      <Card className="border-2 border-primary/10 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm animate-in slide-in-from-bottom duration-700 delay-200">
        <CardHeader className="pb-6">
        </CardHeader>
        <CardContent className="space-y-8">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in duration-300">
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex justify-center py-4">
            <CustomToggle
              checked={isManualMode}
              onChange={handleToggleChange}
              leftLabel="Carte grise"
              rightLabel="Manuel"
            />
          </div>

          {/* VIN Search Section */}
          {!isManualMode && (
            <div className="space-y-4 animate-in fade-in duration-700">
              <VinSelector 
                onVehicleSelect={handleVinVehicleSelect}
                onBack={() => {}}
              />
            </div>
          )}

          {/* Manual Selection Section */}
          {isManualMode && (
            <div className="space-y-6 animate-in fade-in duration-700 delay-200">
              <div className="space-y-4">
                {/* Progress Steps */}
                <div className="flex items-center justify-center space-x-2 sm:space-x-4 mb-8 px-4">
                  <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedBrand ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      selectedBrand ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedBrand ? <CheckCircle className="h-4 w-4" /> : '1'}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">Marque</span>
                  </div>
                  <div className={`w-4 sm:w-8 h-1 rounded transition-all duration-500 ${selectedBrand ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedModel ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      selectedModel ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedModel ? <CheckCircle className="h-4 w-4" /> : '2'}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">Modèle</span>
                  </div>
                  <div className={`w-4 sm:w-8 h-1 rounded transition-all duration-500 ${selectedModel ? 'bg-primary' : 'bg-muted'}`} />
                  <div className={`flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 transition-all duration-500 ${selectedVehicle ? 'text-primary' : 'text-muted-foreground'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                      selectedVehicle ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'
                    }`}>
                      {selectedVehicle ? <CheckCircle className="h-4 w-4" /> : '3'}
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-center">Motorisation</span>
                  </div>
                </div>

                {/* Selection Form */}
                <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
                  {/* Brand Selection */}
                  <div className="space-y-4 group">
                    <label className="text-sm font-bold text-foreground flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Car className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div>Marque du véhicule</div>
                        <div className="text-xs text-muted-foreground font-normal">Étape 1 sur 3</div>
                      </div>
                    </label>
                    {loadingManufacturers ? (
                      <div className="h-14 bg-gradient-to-r from-muted/30 to-muted/60 rounded-xl flex items-center justify-center animate-pulse border-2 border-muted/50">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Chargement...</span>
                        </div>
                      </div>
                    ) : (
                      <SimpleSelect
                        options={formatManufacturersOptions()}
                        value={selectedBrand?.manufacturerId.toString() || ""}
                        onValueChange={handleBrandChange}
                        placeholder="Choisissez votre marque"
                        disabled={loadingManufacturers}
                        className="group-hover:shadow-lg transition-all duration-300 h-14"
                      />
                    )}
                  </div>

                  {/* Model Selection */}
                  <div className="space-y-4 group">
                    <label className="text-sm font-bold text-foreground flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div>Modèle et année</div>
                        <div className="text-xs text-muted-foreground font-normal">Étape 2 sur 3</div>
                      </div>
                    </label>
                    {loadingModels ? (
                      <div className="h-14 bg-gradient-to-r from-muted/30 to-muted/60 rounded-xl flex items-center justify-center animate-pulse border-2 border-muted/50">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Chargement...</span>
                        </div>
                      </div>
                    ) : (
                      <SimpleSelect
                        options={formatModelsOptions()}
                        value={selectedModel?.modelId.toString() || ""}
                        onValueChange={handleModelChange}
                        placeholder="Choisissez d'abord une marque"
                        disabled={!selectedBrand || models.length === 0}
                        className="group-hover:shadow-lg transition-all duration-300 h-14"
                      />
                    )}
                  </div>

                  {/* Engine Selection */}
                  <div className="space-y-4 group">
                    <label className="text-sm font-bold text-foreground flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Fuel className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div>Motorisation</div>
                        <div className="text-xs text-muted-foreground font-normal">Étape 3 sur 3</div>
                      </div>
                    </label>
                    {loadingVehicles ? (
                      <div className="h-14 bg-gradient-to-r from-muted/30 to-muted/60 rounded-xl flex items-center justify-center animate-pulse border-2 border-muted/50">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Chargement...</span>
                        </div>
                      </div>
                    ) : (
                      <SimpleSelect
                        options={formatVehiclesOptions()}
                        value={selectedVehicle?.vehicleId.toString() || ""}
                        onValueChange={handleVehicleChange}
                        placeholder="Choisissez d'abord un modèle"
                        disabled={!selectedModel || vehicles.length === 0}
                        className="group-hover:shadow-lg transition-all duration-300 h-14"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Selected Vehicle Summary - Works for both manual and VIN selection */}
          {(selectedVehicle || vinVehicle) && (
            <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl animate-in slide-in-from-bottom duration-500 delay-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-primary">Véhicule sélectionné</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Car Image */}
                {carImage && (
                  <div className="flex-shrink-0">
                    <div className="w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-muted/30 to-muted/60">
                      {loadingCarImage ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                      ) : (
                        <img
                          src={carImage}
                          alt="Vehicle"
                          className="w-full h-full object-cover"
                          onError={() => setCarImage(null)}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Vehicle Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {selectedBrand && (
                      <Badge variant="secondary" className="text-xs">
                        {selectedBrand.brand}
                      </Badge>
                    )}
                    {selectedModel && (
                      <Badge variant="outline" className="text-xs">
                        {selectedModel.modelName}
                      </Badge>
                    )}
                    {selectedVehicle && (
                      <Badge variant="outline" className="text-xs">
                        {selectedVehicle.typeEngineName}
                      </Badge>
                    )}
                    {vinVehicle && (
                      <Badge variant="outline" className="text-xs">
                        {vinVehicle.carName}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {selectedVehicle && (
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Fuel className="h-3 w-3" />
                          {selectedVehicle.fuelType}
                        </span>
                        <span>{selectedVehicle.powerPs}ch ({selectedVehicle.powerKw}kW)</span>
                      </div>
                    )}
                    {vinVehicle && (
                      <div className="flex items-center gap-1">
                        <Car className="h-3 w-3" />
                        {vinVehicle.vehicleTypeDescription}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categories Section */}
      {((isManualMode && selectedVehicle && selectedBrand) || (!isManualMode && vinVehicle)) && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <HierarchicalCategories
            manufacturerId={selectedBrand?.manufacturerId || vinVehicle?.manuId || 0}
            vehicleId={selectedVehicle?.vehicleId || vinVehicle?.carId || 0}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      )}

      {/* Articles List */}
      {selectedCategory && ((isManualMode && selectedBrand && selectedVehicle) || (!isManualMode && vinVehicle)) && !selectedArticle && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-400">
          <ModernArticlesList
            manufacturerId={selectedBrand?.manufacturerId || vinVehicle?.manuId || 0}
            vehicleId={selectedVehicle?.vehicleId || vinVehicle?.carId || 0}
            productGroupId={selectedCategory.id}
            categoryName={selectedCategory.name}
            onArticleSelect={handleArticleSelect}
          />
        </div>
      )}

      {/* Article Details */}
      {selectedArticle && (
        <div className="animate-in fade-in slide-in-from-bottom duration-700 delay-500">
          <ArticleDetails articleId={selectedArticle} onBack={handleBackFromArticle} />
        </div>
      )}
    </div>
  )
}
