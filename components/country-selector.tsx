"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { forwardRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Globe, Search, Check, MapPin } from "lucide-react"
import { useCountry } from "@/contexts/country-context"
import { getAllCountries, getCommonCountries, getAllCountriesList } from "@/lib/countries-api"

interface Country {
  id: number
  couCode: string
  countryName: string
}

interface CountrySelectorProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

// Create a forwardRef wrapper for the trigger button to avoid ref warnings
const CountryTriggerButton = forwardRef<HTMLButtonElement, any>(({ children, ...props }, ref) => (
  <Button ref={ref} {...props}>
    {children}
  </Button>
))
CountryTriggerButton.displayName = "CountryTriggerButton"

export function CountrySelector({ className = "", variant = "default", size = "default" }: CountrySelectorProps) {
  const { selectedCountry, setSelectedCountry, countries, setCountries, isLoading, setIsLoading } = useCountry()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([])

  useEffect(() => {
    if (isOpen && countries.length === 0) {
      loadCountries()
    }
  }, [isOpen, countries.length])

  useEffect(() => {
    if (countries.length > 0) {
      const filtered = countries.filter(country =>
        country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.couCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCountries(filtered)
    }
  }, [searchTerm, countries])

  const loadCountries = async () => {
    setIsLoading(true)
    try {
      const response = await getAllCountries()
      if (response.data) {
        setCountries(response.data)
        setFilteredCountries(response.data)
        console.log(`[CountrySelector] Loaded ${response.data.length} countries`)
      } else {
        console.error('[CountrySelector] Failed to load countries:', response.error)
        // Fallback to complete countries list if API fails
        const allCountries = getAllCountriesList()
        setCountries(allCountries)
        setFilteredCountries(allCountries)
        console.log(`[CountrySelector] Using fallback: ${allCountries.length} countries available`)
      }
    } catch (error) {
      console.error('[CountrySelector] Error loading countries:', error)
      // Fallback to complete countries list
      const allCountries = getAllCountriesList()
      setCountries(allCountries)
      setFilteredCountries(allCountries)
      console.log(`[CountrySelector] Using fallback after error: ${allCountries.length} countries available`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country)
    setIsOpen(false)
    setSearchTerm("")
  }

  const commonCountries = getCommonCountries()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <CountryTriggerButton
          variant={variant}
          size={size}
          className={`justify-start gap-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">Country:</span>
          <Badge variant="secondary" className="text-xs">
            {selectedCountry.couCode}
          </Badge>
          <span className="hidden md:inline text-sm text-muted-foreground">
            {selectedCountry.countryName}
          </span>
        </CountryTriggerButton>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Country
          </DialogTitle>
          <DialogDescription>
            Choose your country to filter compatible parts and regional availability.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Common Countries */}
          {!searchTerm && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Common Countries</h4>
              <div className="grid grid-cols-2 gap-2">
                {commonCountries.map((country) => (
                  <Button
                    key={country.id}
                    variant={selectedCountry.id === country.id ? "default" : "outline"}
                    size="sm"
                    className="justify-start h-auto p-2"
                    onClick={() => handleCountrySelect(country)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Badge variant="secondary" className="text-xs">
                        {country.couCode}
                      </Badge>
                      <span className="text-xs truncate">{country.countryName}</span>
                      {selectedCountry.id === country.id && (
                        <Check className="h-3 w-3 ml-auto" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* All Countries */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {searchTerm ? `Search Results (${filteredCountries.length})` : 'All Countries'}
            </h4>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading countries...</span>
              </div>
            ) : (
              <ScrollArea className="h-64">
                <div className="space-y-1">
                  {filteredCountries.map((country) => (
                    <Button
                      key={country.id}
                      variant={selectedCountry.id === country.id ? "default" : "ghost"}
                      size="sm"
                      className="justify-start w-full h-auto p-2"
                      onClick={() => handleCountrySelect(country)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Badge variant="secondary" className="text-xs">
                          {country.couCode}
                        </Badge>
                        <span className="text-xs flex-1 text-left">{country.countryName}</span>
                        {selectedCountry.id === country.id && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Selected Country Info */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Selected:</span>
              <div className="flex items-center gap-2">
                <Badge variant="default">{selectedCountry.couCode}</Badge>
                <span className="text-sm">{selectedCountry.countryName}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Parts compatibility and availability will be filtered for this region.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
