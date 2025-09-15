"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface VehicleInfo {
  // Manual selection data
  manufacturerId?: number
  vehicleId?: number
  manufacturerName?: string
  modelName?: string
  typeEngineName?: string
  powerKw?: string
  powerPs?: string
  fuelType?: string
  bodyType?: string
  constructionIntervalStart?: string
  constructionIntervalEnd?: string | null
  
  // VIN selection data
  manuId?: number
  carId?: number
  carName?: string
  modelId?: number
  vehicleTypeDescription?: string
  
  // Selection method
  selectionMethod?: 'manual' | 'vin'
}

export interface CategoryInfo {
  categoryId: string
  categoryName: string
}

export interface ArticleInfo {
  articleId: number
  vehicleName: string
  categoryName: string
}

interface VehicleContextType {
  vehicleInfo: VehicleInfo | null
  categoryInfo: CategoryInfo | null
  articleInfo: ArticleInfo | null
  setVehicleInfo: (info: VehicleInfo | null) => void
  setCategoryInfo: (info: CategoryInfo | null) => void
  setArticleInfo: (info: ArticleInfo | null) => void
  clearAll: () => void
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined)

export function VehicleProvider({ children }: { children: ReactNode }) {
  const [vehicleInfo, setVehicleInfoState] = useState<VehicleInfo | null>(null)
  const [categoryInfo, setCategoryInfoState] = useState<CategoryInfo | null>(null)
  const [articleInfo, setArticleInfoState] = useState<ArticleInfo | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedVehicleInfo = localStorage.getItem('vehicleInfo')
      const savedCategoryInfo = localStorage.getItem('categoryInfo')
      const savedArticleInfo = localStorage.getItem('articleInfo')

      console.log('[VehicleContext] Loading from localStorage:', {
        vehicleInfo: savedVehicleInfo,
        categoryInfo: savedCategoryInfo,
        articleInfo: savedArticleInfo
      })

      if (savedVehicleInfo) {
        const parsed = JSON.parse(savedVehicleInfo)
        console.log('[VehicleContext] Restored vehicle info:', parsed)
        setVehicleInfoState(parsed)
      }
      if (savedCategoryInfo) {
        setCategoryInfoState(JSON.parse(savedCategoryInfo))
      }
      if (savedArticleInfo) {
        setArticleInfoState(JSON.parse(savedArticleInfo))
      }
    } catch (error) {
      console.error('Error loading vehicle context from localStorage:', error)
    }
    setIsInitialized(true)
  }, [])

  const setVehicleInfo = (info: VehicleInfo | null) => {
    console.log('[VehicleContext] Setting vehicle info:', info)
    setVehicleInfoState(info)
    try {
      if (info) {
        localStorage.setItem('vehicleInfo', JSON.stringify(info))
        console.log('[VehicleContext] Saved to localStorage:', info)
      } else {
        localStorage.removeItem('vehicleInfo')
        console.log('[VehicleContext] Removed from localStorage')
      }
    } catch (error) {
      console.error('Error saving vehicle info to localStorage:', error)
    }
  }

  const setCategoryInfo = (info: CategoryInfo | null) => {
    setCategoryInfoState(info)
    try {
      if (info) {
        localStorage.setItem('categoryInfo', JSON.stringify(info))
      } else {
        localStorage.removeItem('categoryInfo')
      }
    } catch (error) {
      console.error('Error saving category info to localStorage:', error)
    }
  }

  const setArticleInfo = (info: ArticleInfo | null) => {
    setArticleInfoState(info)
    try {
      if (info) {
        localStorage.setItem('articleInfo', JSON.stringify(info))
      } else {
        localStorage.removeItem('articleInfo')
      }
    } catch (error) {
      console.error('Error saving article info to localStorage:', error)
    }
  }

  const clearAll = () => {
    setVehicleInfoState(null)
    setCategoryInfoState(null)
    setArticleInfoState(null)
    try {
      localStorage.removeItem('vehicleInfo')
      localStorage.removeItem('categoryInfo')
      localStorage.removeItem('articleInfo')
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Don't render children until we've loaded from localStorage
  if (!isInitialized) {
    return null
  }

  return (
    <VehicleContext.Provider value={{
      vehicleInfo,
      categoryInfo,
      articleInfo,
      setVehicleInfo,
      setCategoryInfo,
      setArticleInfo,
      clearAll
    }}>
      {children}
    </VehicleContext.Provider>
  )
}

export function useVehicle() {
  const context = useContext(VehicleContext)
  if (context === undefined) {
    throw new Error('useVehicle must be used within a VehicleProvider')
  }
  return context
}
