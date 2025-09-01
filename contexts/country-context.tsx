"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Country {
  id: number
  couCode: string
  countryName: string
}

interface CountryContextType {
  selectedCountry: Country
  setSelectedCountry: (country: Country) => void
  countries: Country[]
  setCountries: (countries: Country[]) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const defaultCountry: Country = {
  id: 253,
  couCode: "TN", 
  countryName: "Tunisia"
}

const CountryContext = createContext<CountryContextType | undefined>(undefined)

interface CountryProviderProps {
  children: ReactNode
}

export function CountryProvider({ children }: CountryProviderProps) {
  const [selectedCountry, setSelectedCountryState] = useState<Country>(defaultCountry)
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Load saved country from localStorage on mount
  useEffect(() => {
    const savedCountry = localStorage.getItem('selectedCountry')
    if (savedCountry) {
      try {
        const parsedCountry = JSON.parse(savedCountry)
        setSelectedCountryState(parsedCountry)
        console.log('[CountryContext] Loaded saved country:', parsedCountry.countryName)
      } catch (error) {
        console.warn('[CountryContext] Failed to parse saved country, using default')
      }
    }
  }, [])

  const setSelectedCountry = (country: Country) => {
    setSelectedCountryState(country)
    localStorage.setItem('selectedCountry', JSON.stringify(country))
    console.log('[CountryContext] Country changed to:', country.countryName, `(ID: ${country.id})`)
  }

  const value: CountryContextType = {
    selectedCountry,
    setSelectedCountry,
    countries,
    setCountries,
    isLoading,
    setIsLoading
  }

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  )
}

export function useCountry() {
  const context = useContext(CountryContext)
  if (context === undefined) {
    throw new Error('useCountry must be used within a CountryProvider')
  }
  return context
}
