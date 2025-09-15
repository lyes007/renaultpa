"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { SimpleSelect } from "@/components/ui/simple-select"
import {
  Loader2,
  Car,
  Calendar,
  Fuel,
  CheckCircle,
  Search,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { getManufacturers, getModels, getVehicles, vinCheck } from "@/lib/apify-api"
import { getManufacturerLogo } from "@/lib/car-logos"
import { useCountry } from "@/contexts/country-context"
import { useVehicle } from "@/contexts/vehicle-context"
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

interface VinVehicle {
  manuId: number
  carId: number
  carName: string
  modelId: number
  vehicleTypeDescription: string
}

export function VehicleSelector() {
  const { selectedCountry } = useCountry()
  const { vehicleInfo, setVehicleInfo } = useVehicle()
  const router = useRouter()

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
  const [vin, setVin] = useState("")
  const [vinLoading, setVinLoading] = useState(false)
  const [vinVehicles, setVinVehicles] = useState<VinVehicle[]>([])
  const [vinError, setVinError] = useState<string | null>(null)
  const [hasVinSearched, setHasVinSearched] = useState(false)
  const [currentVinPage, setCurrentVinPage] = useState(1)
  const vinItemsPerPage = 6

  const [loadingManufacturers, setLoadingManufacturers] = useState(true)
  const [loadingModels, setLoadingModels] = useState(false)
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load manufacturers on component mount
  useEffect(() => {
    loadManufacturers()
  }, [selectedCountry.id])

  // Restore previous selection from context
  useEffect(() => {
    const restoreSelection = async () => {
      if (vehicleInfo && manufacturers.length > 0 && !isInitialized) {
        setIsInitialized(true)
        console.log("[VehicleSelector] Restoring selection:", vehicleInfo)

        if (vehicleInfo.selectionMethod === "manual") {
          // Set toggle to manual mode
          setIsManualMode(true)

          // Find and set the manufacturer
          const manufacturer = manufacturers.find((m) => m.manufacturerId === vehicleInfo.manufacturerId)
          if (manufacturer) {
            setSelectedBrand(manufacturer)

            try {
              // Load models for this manufacturer
              await loadModels(manufacturer.manufacturerId)

              // Find and set the model after models are loaded
              const model = models.find((m) => m.modelName === vehicleInfo.modelName)
              if (model) {
                setSelectedModel(model)

                // Load vehicles for this model
                await loadVehicles(manufacturer.manufacturerId, model.modelId)

                // Find and set the vehicle after vehicles are loaded
                const vehicle = vehicles.find((v) => v.typeEngineName === vehicleInfo.typeEngineName)
                if (vehicle) {
                  setSelectedVehicle(vehicle)
                }
              }
            } catch (error) {
              console.error("[VehicleSelector] Error restoring manual selection:", error)
            }
          }
        } else if (vehicleInfo.selectionMethod === "vin") {
          // Set toggle to VIN mode
          setIsManualMode(false)

          // Restore VIN vehicle info
          setVinVehicle({
            manuId: vehicleInfo.manuId || 0,
            carId: vehicleInfo.carId || 0,
            carName: vehicleInfo.carName || "",
            modelId: vehicleInfo.modelId || 0,
            vehicleTypeDescription: vehicleInfo.vehicleTypeDescription || "",
          })
        }
      }
    }

    restoreSelection()
  }, [vehicleInfo, manufacturers, isInitialized])

  // Update models and vehicles when dependencies change during restoration
  useEffect(() => {
    const updateModels = async () => {
      if (selectedBrand && vehicleInfo?.selectionMethod === "manual" && models.length === 0) {
        try {
          const modelsData = await loadModels(selectedBrand.manufacturerId)
          const model = modelsData.find((m: any) => m.modelName === vehicleInfo.modelName)
          if (model && !selectedModel) {
            setSelectedModel(model)
          }
        } catch (error) {
          console.error("[VehicleSelector] Error loading models during restoration:", error)
        }
      }
    }
    updateModels()
  }, [selectedBrand, vehicleInfo, models.length, selectedModel])

  useEffect(() => {
    const updateVehicles = async () => {
      if (selectedBrand && selectedModel && vehicleInfo?.selectionMethod === "manual" && vehicles.length === 0) {
        try {
          const vehiclesData = await loadVehicles(selectedBrand.manufacturerId, selectedModel.modelId)
          const vehicle = vehiclesData.find((v: any) => v.typeEngineName === vehicleInfo.typeEngineName)
          if (vehicle && !selectedVehicle) {
            setSelectedVehicle(vehicle)
          }
        } catch (error) {
          console.error("[VehicleSelector] Error loading vehicles during restoration:", error)
        }
      }
    }
    updateVehicles()
  }, [selectedBrand, selectedModel, vehicleInfo, vehicles.length, selectedVehicle])

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
      console.log("[v0] Full response:", response)
      console.log("[v0] Response data:", response.data)
      console.log("[v0] Extracted manufacturers:", manufacturersData)

      // Filter to only show Renault, Dacia, and Nissan
      const allowedBrands = ["RENAULT", "DACIA", "NISSAN"]
      const filteredManufacturers = manufacturersData.filter((manufacturer: Manufacturer) =>
        allowedBrands.includes(manufacturer.brand.toUpperCase()),
      )
      console.log("[v0] Filtered manufacturers:", filteredManufacturers)
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
        return Promise.reject(response.error)
      }

      const modelsData = (response.data as any)?.[0]?.models || []
      console.log("[v0] Extracted models:", modelsData)
      setModels(modelsData)
      return Promise.resolve(modelsData)
    } catch (err) {
      setError("Erreur lors du chargement des modèles")
      console.error("Error loading models:", err)
      return Promise.reject(err)
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
        return Promise.reject(response.error)
      }

      const vehiclesData = (response.data as any)?.[0]?.modelTypes || []
      console.log("[v0] Extracted vehicles:", vehiclesData)
      setVehicles(vehiclesData)
      return Promise.resolve(vehiclesData)
    } catch (err) {
      setError("Erreur lors du chargement des motorisations")
      console.error("Error loading vehicles:", err)
      return Promise.reject(err)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const handleBrandChange = (brandId: string) => {
    const brand = manufacturers.find((m) => m.manufacturerId.toString() === brandId)
    if (brand) {
      setSelectedBrand(brand)
      setSelectedModel(null)
      setSelectedVehicle(null)
      setModels([])
      setVehicles([])
      loadModels(brand.manufacturerId)
    }
  }

  const handleModelChange = (modelId: string) => {
    const model = models.find((m) => m.modelId.toString() === modelId)
    if (model && selectedBrand) {
      setSelectedModel(model)
      setSelectedVehicle(null)
      setVehicles([])
      loadVehicles(selectedBrand.manufacturerId, model.modelId)
    }
  }

  const handleVehicleChange = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.vehicleId.toString() === vehicleId)
    if (vehicle && selectedBrand) {
      setSelectedVehicle(vehicle)

      // Set vehicle info in context
      setVehicleInfo({
        selectionMethod: "manual",
        manufacturerId: selectedBrand.manufacturerId,
        vehicleId: vehicle.vehicleId,
        manufacturerName: vehicle.manufacturerName,
        modelName: vehicle.modelName,
        typeEngineName: vehicle.typeEngineName,
        powerKw: vehicle.powerKw,
        powerPs: vehicle.powerPs,
        fuelType: vehicle.fuelType,
        bodyType: vehicle.bodyType,
        constructionIntervalStart: vehicle.constructionIntervalStart,
        constructionIntervalEnd: vehicle.constructionIntervalEnd,
      })

      // Navigate to categories page
      router.push("/categories")
    }
  }

  const handleVinVehicleSelect = (vehicle: VinVehicle) => {
    console.log("[VIN] Vehicle selected:", vehicle)
    setVinVehicle(vehicle)

    // Set vehicle info in context
    setVehicleInfo({
      selectionMethod: "vin",
      manuId: vehicle.manuId,
      carId: vehicle.carId,
      carName: vehicle.carName,
      modelId: vehicle.modelId,
      vehicleTypeDescription: vehicle.vehicleTypeDescription,
    })

    // Navigate to categories page
    router.push("/categories")
  }

  // VIN search functionality
  const handleVinSearch = async () => {
    if (!vin.trim()) {
      setVinError("Veuillez saisir un numéro VIN")
      return
    }

    if (vin.length !== 17) {
      setVinError("Le numéro VIN doit contenir exactement 17 caractères")
      return
    }

    try {
      setVinLoading(true)
      setVinError(null)
      setVinVehicles([])
      setHasVinSearched(false)
      setCurrentVinPage(1)

      console.log("[VIN] Searching for VIN:", vin)
      const response = await vinCheck(vin.toUpperCase(), selectedCountry.id)

      if (response.error) {
        setVinError(response.error)
        setHasVinSearched(true)
        return
      }

      const data = response.data?.[0]?.data
      const matchingVehicles = data?.matchingVehicles?.array || []

      console.log("[VIN] Found", matchingVehicles.length, "matching vehicles")

      if (matchingVehicles.length === 0) {
        setVinError(`Aucun véhicule trouvé pour le VIN "${vin}" dans notre base de données TecDoc. 
        
Cela peut arriver si :
• Le VIN n'est pas encore référencé dans TecDoc
• Le véhicule est trop récent ou trop ancien
• Il y a une erreur de frappe dans le VIN

Veuillez vérifier le VIN ou utiliser la sélection manuelle ci-dessous.`)
        setHasVinSearched(true)
        return
      }

      setVinVehicles(matchingVehicles)
      setHasVinSearched(true)
    } catch (err) {
      console.error("[VIN] Search error:", err)
      setVinError("Erreur lors de la recherche VIN. Veuillez réessayer.")
      setHasVinSearched(true)
    } finally {
      setVinLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVinSearch()
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setIsManualMode(checked)
    // Reset all selections when switching modes
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedVehicle(null)
    setVinVehicle(null)
    setVin("")
    setVinVehicles([])
    setVinError(null)
    setHasVinSearched(false)
    setModels([])
    setVehicles([])
  }

  // Format data for SimpleSelect components
  const formatManufacturersOptions = () => {
    if (!manufacturers || !Array.isArray(manufacturers)) {
      return []
    }
    const options = manufacturers.map((manufacturer) => ({
      value: manufacturer.manufacturerId.toString(),
      label: manufacturer.brand,
      logo: getManufacturerLogo(manufacturer.brand),
    }))
    console.log("Formatted manufacturers options:", options.length, options.slice(0, 5))
    return options
  }

  const formatModelsOptions = () => {
    if (!models || !Array.isArray(models)) {
      return []
    }
    return models.map((model) => ({
      value: model.modelId.toString(),
      label: model.modelName,
      sublabel: `${model.modelYearFrom ? model.modelYearFrom.split("-")[0] : "N/A"} - ${model.modelYearTo ? model.modelYearTo.split("-")[0] : "présent"}`,
    }))
  }

  const formatVehiclesOptions = () => {
    if (!vehicles || !Array.isArray(vehicles)) {
      return []
    }
    return vehicles.map((vehicle) => ({
      value: vehicle.vehicleId.toString(),
      label: vehicle.typeEngineName,
      sublabel: `${vehicle.powerPs}ch (${vehicle.powerKw}kW) • ${vehicle.fuelType}`,
    }))
  }

  // VIN Pagination helpers
  const vinTotalPages = Math.ceil(vinVehicles.length / vinItemsPerPage)
  const vinStartIndex = (currentVinPage - 1) * vinItemsPerPage
  const vinEndIndex = vinStartIndex + vinItemsPerPage
  const currentVinVehicles = vinVehicles.slice(vinStartIndex, vinEndIndex)

  const goToVinPage = (page: number) => {
    setCurrentVinPage(page)
  }

  const goToPrevVinPage = () => {
    setCurrentVinPage((prev) => Math.max(1, prev - 1))
  }

  const goToNextVinPage = () => {
    setCurrentVinPage((prev) => Math.min(vinTotalPages, prev + 1))
  }

  const getVinPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (vinTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= vinTotalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentVinPage - 2)
      const endPage = Math.min(vinTotalPages, startPage + maxVisiblePages - 1)

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }

    return pages
  }

  return (
    <div className="space-y-4">
      {/* Vehicle Selection Card */}
      <Card className="border border-primary/10 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2"></CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in duration-300">
              <p className="text-sm text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="flex justify-center">
            <CustomToggle
              checked={isManualMode}
              onChange={handleToggleChange}
              leftLabel="Carte grise"
              rightLabel="Manuel"
            />
          </div>

          {/* VIN Search Section */}
          {!isManualMode && (
            <div className="space-y-4">
              {/* VIN Input Section - Integrated */}
              <Card className="border border-primary/10 shadow-md bg-gradient-to-br from-card to-card/95">
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full mb-2">
                        <Search className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-primary mb-2">Recherche par carte grise</h3>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-2 block flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                          Numéro VIN (17 caractères)
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <div className="flex-1">
                            <Input
                              value={vin}
                              onChange={(e) => setVin(e.target.value.toUpperCase())}
                              onKeyPress={handleKeyPress}
                              placeholder="Ex: WVWZZZ1JZ3W386752"
                              className="font-mono text-sm h-9 border focus:border-primary/50 transition-colors"
                              maxLength={17}
                              disabled={vinLoading}
                            />
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-muted-foreground">Tableau de bord ou carte grise</p>
                              <span
                                className={`text-xs font-medium ${vin.length === 17 ? "text-green-600" : "text-muted-foreground"}`}
                              >
                                {vin.length}/17
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={handleVinSearch}
                            disabled={vinLoading || !vin.trim() || vin.length !== 17}
                            className="h-9 px-4 sm:px-6 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            size="sm"
                          >
                            {vinLoading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span className="hidden sm:inline">Recherche...</span>
                              </>
                            ) : (
                              <>
                                <Search className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Rechercher</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      {vinError && (
                        <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl animate-in fade-in duration-300">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm text-destructive font-medium whitespace-pre-line">{vinError}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* VIN Vehicle Results */}
              {hasVinSearched && vinVehicles.length > 0 && (
                <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-card to-card/95 animate-in slide-in-from-bottom duration-500">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                          {vinVehicles.length > 1 ? "Véhicules trouvés" : "Véhicule identifié"}
                        </h3>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {vinVehicles.length > 1
                              ? `${vinVehicles.length} véhicules correspondent à ce VIN`
                              : "Véhicule identifié avec succès"}
                          </span>
                          {vinVehicles.length > 1 && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>
                                Page {currentVinPage} sur {vinTotalPages}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Vehicle Grid */}
                      <div className="grid gap-4 sm:gap-6">
                        {currentVinVehicles.map((vehicle, index) => (
                          <Card
                            key={vehicle.carId}
                            className="group border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-background/50"
                            onClick={() => handleVinVehicleSelect(vehicle)}
                          >
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {/* Vehicle Icon and Info */}
                                <div className="flex items-start gap-4 flex-1">
                                  <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-colors">
                                      <Car className="h-6 w-6 text-primary" />
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-foreground text-base sm:text-lg mb-1 group-hover:text-primary transition-colors">
                                      {vehicle.carName}
                                    </h4>
                                    <p className="text-sm text-muted-foreground mb-2 font-medium">
                                      {vehicle.vehicleTypeDescription}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground">
                                        ID: {vehicle.carId}
                                      </span>
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary">
                                        #{vinStartIndex + index + 1}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Select Button */}
                                <div className="w-full sm:w-auto">
                                  <Button
                                    variant="default"
                                    className="w-full sm:w-auto px-6 py-2 font-semibold shadow-md group-hover:shadow-lg transition-all duration-200"
                                    size="sm"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Sélectionner
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Pagination */}
                      {vinTotalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                          <div className="text-sm text-muted-foreground">
                            Affichage de {vinStartIndex + 1} à {Math.min(vinEndIndex, vinVehicles.length)} sur{" "}
                            {vinVehicles.length} véhicules
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevVinPage}
                              disabled={currentVinPage === 1}
                              className="h-9 w-9 p-0 bg-transparent"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                              {getVinPageNumbers().map((pageNum, index, array) => {
                                const isCurrentPage = pageNum === currentVinPage
                                return (
                                  <Button
                                    key={pageNum}
                                    variant={isCurrentPage ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => goToVinPage(pageNum)}
                                    className={`h-9 w-9 p-0 ${isCurrentPage ? "shadow-md" : ""}`}
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextVinPage}
                              disabled={currentVinPage === vinTotalPages}
                              className="h-9 w-9 p-0 bg-transparent"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Manual Selection Section */}
          {isManualMode && (
            <Card className="border border-primary/10 shadow-md bg-gradient-to-br from-card to-card/95">
              <CardContent className="p-3 sm:p-4">
                <div className="space-y-4">
                  {/* Progress Steps and Form are inside this div */}
                  <div className="space-y-4">
                    {/* Progress Steps */}
                    <div className="flex items-center justify-center space-x-2 mb-3 px-2">
                      <div
                        className={`flex flex-col items-center space-y-0.5 transition-all duration-500 ${selectedBrand ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selectedBrand ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}
                        >
                          {selectedBrand ? <CheckCircle className="h-2.5 w-2.5" /> : "1"}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Marque</span>
                      </div>
                      <div
                        className={`w-2 h-0.5 rounded transition-all duration-500 ${selectedBrand ? "bg-primary" : "bg-muted"}`}
                      />
                      <div
                        className={`flex flex-col items-center space-y-0.5 transition-all duration-500 ${selectedModel ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selectedModel ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}
                        >
                          {selectedModel ? <CheckCircle className="h-2.5 w-2.5" /> : "2"}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Modèle</span>
                      </div>
                      <div
                        className={`w-2 h-0.5 rounded transition-all duration-500 ${selectedModel ? "bg-primary" : "bg-muted"}`}
                      />
                      <div
                        className={`flex flex-col items-center space-y-0.5 transition-all duration-500 ${selectedVehicle ? "text-primary" : "text-muted-foreground"}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${selectedVehicle ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"}`}
                        >
                          {selectedVehicle ? <CheckCircle className="h-2.5 w-2.5" /> : "3"}
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">Motorisation</span>
                      </div>
                    </div>

                    {/* Selection Form */}
                    <div className="space-y-4">
                      {/* Brand Selection */}
                      <div className="space-y-2 group">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                            <Car className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <div>Marque du véhicule</div>
                            <div className="text-xs text-muted-foreground font-normal">Étape 1 sur 3</div>
                          </div>
                        </label>
                        {loadingManufacturers ? (
                          <div className="h-10 bg-gradient-to-r from-muted/30 to-muted/60 rounded-lg flex items-center justify-center animate-pulse border border-muted/50">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Chargement...</span>
                            </div>
                          </div>
                        ) : (
                          <SimpleSelect
                            options={formatManufacturersOptions()}
                            value={selectedBrand?.manufacturerId.toString() || ""}
                            onValueChange={handleBrandChange}
                            placeholder="Choisissez votre marque"
                            disabled={loadingManufacturers}
                            className="group-hover:shadow-lg transition-all duration-300 h-10"
                          />
                        )}
                      </div>

                      {/* Model Selection */}
                      <div className="space-y-2 group">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                            <Calendar className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <div>Modèle et année</div>
                            <div className="text-xs text-muted-foreground font-normal">Étape 2 sur 3</div>
                          </div>
                        </label>
                        {loadingModels ? (
                          <div className="h-10 bg-gradient-to-r from-muted/30 to-muted/60 rounded-lg flex items-center justify-center animate-pulse border border-muted/50">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Chargement...</span>
                            </div>
                          </div>
                        ) : (
                          <SimpleSelect
                            options={formatModelsOptions()}
                            value={selectedModel?.modelId.toString() || ""}
                            onValueChange={handleModelChange}
                            placeholder="Choisissez d'abord une marque"
                            disabled={!selectedBrand || models.length === 0}
                            className="group-hover:shadow-lg transition-all duration-300 h-10"
                          />
                        )}
                      </div>

                      {/* Engine Selection */}
                      <div className="space-y-2 group">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 bg-primary/10 rounded-md flex items-center justify-center">
                            <Fuel className="h-3 w-3 text-primary" />
                          </div>
                          <div>
                            <div>Motorisation</div>
                            <div className="text-xs text-muted-foreground font-normal">Étape 3 sur 3</div>
                          </div>
                        </label>
                        {loadingVehicles ? (
                          <div className="h-10 bg-gradient-to-r from-muted/30 to-muted/60 rounded-lg flex items-center justify-center animate-pulse border border-muted/50">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-3 w-3 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground">Chargement...</span>
                            </div>
                          </div>
                        ) : (
                          <SimpleSelect
                            options={formatVehiclesOptions()}
                            value={selectedVehicle?.vehicleId.toString() || ""}
                            onValueChange={handleVehicleChange}
                            placeholder="Choisissez d'abord un modèle"
                            disabled={!selectedModel || vehicles.length === 0}
                            className="group-hover:shadow-lg transition-all duration-300 h-10"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
