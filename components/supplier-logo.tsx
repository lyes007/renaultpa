"use client"

import { useState } from "react"
import { getSupplierLogoInfo } from "@/lib/supplier-logos"

interface SupplierLogoProps {
  supplierName: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  onLogoLoad?: (hasLogo: boolean) => void
}

export function SupplierLogo({ supplierName, className = "", size = 'small', onLogoLoad }: SupplierLogoProps) {
  const [logoError, setLogoError] = useState(false)
  const [logoLoaded, setLogoLoaded] = useState(false)
  const logoInfo = getSupplierLogoInfo(supplierName)
  
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16', 
    large: 'w-20 h-20'
  }

  // If logo failed to load or doesn't exist, return null (parent will show text)
  if (logoError || !logoInfo.logoPath) {
    // Notify parent that no logo is available
    if (onLogoLoad && !logoLoaded) {
      onLogoLoad(false)
      setLogoLoaded(true)
    }
    return null
  }

  return (
    <div 
      className={`${sizeClasses[size]} flex items-center justify-center ${className}`}
      title={supplierName}
    >
      <img
        src={logoInfo.logoPath}
        alt={`${supplierName} logo`}
        className="w-full h-full object-contain supplier-logo"
        onLoad={() => {
          if (onLogoLoad && !logoLoaded) {
            onLogoLoad(true)
            setLogoLoaded(true)
          }
        }}
        onError={() => {
          setLogoError(true)
          if (onLogoLoad && !logoLoaded) {
            onLogoLoad(false)
            setLogoLoaded(true)
          }
        }}
        style={{
          transform: 'scale(0.7)', // Zoom out effect
          opacity: 0.9
        }}
      />
    </div>
  )
}
