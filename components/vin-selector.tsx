"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, Car, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { vinCheck } from "@/lib/apify-api"
import { useCountry } from "@/contexts/country-context"

interface VinVehicle {
  carId: number
  manuId: number
  carName: string
  modelId: number
  vehicleTypeDescription: string
}

interface VinSelectorProps {
  onVehicleSelect: (vehicle: VinVehicle) => void
  onBack: () => void
}

export function VinSelector({ onVehicleSelect, onBack }: VinSelectorProps) {
  const { selectedCountry } = useCountry()
  const [vin, setVin] = useState("")
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<VinVehicle[]>([])
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6 // Show 6 vehicles per page for better mobile experience

  const handleVinSearch = async () => {
    if (!vin.trim()) {
      setError("Veuillez saisir un numéro VIN")
      return
    }

    if (vin.length !== 17) {
      setError("Le numéro VIN doit contenir exactement 17 caractères")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setVehicles([])
      setHasSearched(false)
      setCurrentPage(1) // Reset pagination on new search

      console.log("[VIN] Searching for VIN:", vin)
      const response = await vinCheck(vin.toUpperCase(), selectedCountry.id)

      if (response.error) {
        setError(response.error)
        setHasSearched(true)
        return
      }

      // Extract matching vehicles from the response
      const data = response.data?.[0]?.data
      const matchingVehicles = data?.matchingVehicles?.array || []

      console.log("[VIN] Found", matchingVehicles.length, "matching vehicles")

      if (matchingVehicles.length === 0) {
        setError(`Aucun véhicule trouvé pour le VIN "${vin}" dans notre base de données TecDoc. 
        
Cela peut arriver si :
• Le VIN n'est pas encore référencé dans TecDoc
• Le véhicule est trop récent ou trop ancien
• Il y a une erreur de frappe dans le VIN

Veuillez vérifier le VIN ou utiliser la sélection manuelle ci-dessous.`)
        setHasSearched(true)
        return
      }

      setVehicles(matchingVehicles)
      setHasSearched(true)
    } catch (err) {
      console.error("[VIN] Search error:", err)
      setError("Erreur lors de la recherche VIN. Veuillez réessayer.")
      setHasSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleVehicleSelect = (vehicle: VinVehicle) => {
    console.log("[VIN] Vehicle selected:", vehicle)
    onVehicleSelect(vehicle)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVinSearch()
    }
  }

  // Pagination helpers
  const totalPages = Math.ceil(vehicles.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentVehicles = vehicles.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      const startPage = Math.max(1, currentPage - 2)
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }
    }
    
    return pages
  }

  return (
    <div className="space-y-6">
      {/* VIN Input Section */}
      <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-card to-card/95">
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                Recherche par carte grise
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground mb-3 block flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                  Numéro VIN (17 caractères)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      onKeyPress={handleKeyPress}
                      placeholder="Ex: WVWZZZ1JZ3W386752"
                      className="font-mono text-base h-12 border-2 focus:border-primary/50 transition-colors"
                      maxLength={17}
                      disabled={loading}
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted-foreground">
                        Tableau de bord ou carte grise
                      </p>
                      <span className={`text-xs font-medium ${vin.length === 17 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {vin.length}/17
                      </span>
                    </div>
                  </div>
                  <Button 
                    onClick={handleVinSearch}
                    disabled={loading || !vin.trim() || vin.length !== 17}
                    className="h-12 px-6 sm:px-8 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                    size="lg"
                  >
                    {loading ? (
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

              {error && (
                <div className="p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Selection Results */}
      {hasSearched && vehicles.length > 0 && (
        <Card className="border-2 border-primary/10 shadow-lg bg-gradient-to-br from-card to-card/95 animate-in slide-in-from-bottom duration-500">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-primary mb-2">
                  {vehicles.length > 1 ? 'Véhicules trouvés' : 'Véhicule identifié'}
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {vehicles.length > 1 
                      ? `${vehicles.length} véhicules correspondent à ce VIN`
                      : "Véhicule identifié avec succès"
                    }
                  </span>
                  {vehicles.length > 1 && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span>Page {currentPage} sur {totalPages}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Vehicle Grid */}
              <div className="grid gap-4 sm:gap-6">
                {currentVehicles.map((vehicle, index) => (
                  <Card 
                    key={vehicle.carId}
                    className="group border-2 border-border hover:border-primary/50 transition-all duration-300 cursor-pointer hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-background to-background/50"
                    onClick={() => handleVehicleSelect(vehicle)}
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
                                #{startIndex + index + 1}
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
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
                  {/* Page Info */}
                  <div className="text-sm text-muted-foreground">
                    Affichage de {startIndex + 1} à {Math.min(endIndex, vehicles.length)} sur {vehicles.length} véhicules
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="h-9 w-9 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, index, array) => {
                        const isCurrentPage = pageNum === currentPage
                        const isFirstOrLast = index === 0 || index === array.length - 1
                        const showEllipsis = !isFirstOrLast && (pageNum !== currentPage - 1 && pageNum !== currentPage + 1)

                        return (
                          <div key={pageNum} className="flex items-center">
                            {showEllipsis && index > 0 && array[index - 1] !== pageNum - 1 && (
                              <div className="px-2 text-muted-foreground">
                                <MoreHorizontal className="h-4 w-4" />
                              </div>
                            )}
                            <Button
                              variant={isCurrentPage ? "default" : "ghost"}
                              size="sm"
                              onClick={() => goToPage(pageNum)}
                              className={`h-9 w-9 p-0 ${isCurrentPage ? 'shadow-md' : ''}`}
                            >
                              {pageNum}
                            </Button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Next Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="h-9 w-9 p-0"
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
  )
}
