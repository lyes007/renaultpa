"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { getSupplierLogoFilename } from "@/lib/supplier-mapping"

interface SupplierLogoProps {
  supplierName: string
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function SupplierLogo({ 
  supplierName, 
  className, 
  size = "md", 
  showText = true 
}: SupplierLogoProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Get the most likely filename using our mapping
  const primaryFilename = getSupplierLogoFilename(supplierName)
  
  // Try different possible filename variations
  const possibleFilenames = [
    primaryFilename,
    primaryFilename.replace('.jpg', '.png'),
    primaryFilename.replace('.jpg', '.jpeg'),
  ]
  
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto", 
    lg: "h-12 w-auto"
  }
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
  
  // Show only text if image failed to load or showText is false
  if (imageError || (!imageLoaded && !showText)) {
    return (
      <div className={cn("flex items-center", className)}>
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {supplierName}
        </span>
      </div>
    )
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={`/suppliers/${possibleFilenames[0]}`}
        alt={`${supplierName} logo`}
        className={cn(
          "object-contain transition-opacity duration-200",
          sizeClasses[size]
        )}
        onError={() => setImageError(true)}
        onLoad={() => {
          setImageLoaded(true)
          setImageError(false)
        }}
      />
      {/* Only show text if image failed to load and showText is true */}
      {imageError && showText && (
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {supplierName}
        </span>
      )}
    </div>
  )
}

// Alternative component that tries multiple logo files
export function SupplierLogoWithFallback({ 
  supplierName, 
  className, 
  size = "md", 
  showText = true 
}: SupplierLogoProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Get the most likely filename using our mapping
  const primaryFilename = getSupplierLogoFilename(supplierName)
  
  // Try different possible filename variations
  const possibleFilenames = [
    primaryFilename,
    primaryFilename.replace('.jpg', '.png'),
    primaryFilename.replace('.jpg', '.jpeg'),
  ]
  
  const sizeClasses = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto", 
    lg: "h-12 w-auto"
  }
  
  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }
  
  const handleImageError = () => {
    if (currentImageIndex < possibleFilenames.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
    } else {
      setImageError(true)
    }
  }
  
  // Show only text if all images failed to load
  if (imageError) {
    return (
      <div className={cn("flex items-center", className)}>
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {supplierName}
        </span>
      </div>
    )
  }
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <img
        src={`/suppliers/${possibleFilenames[currentImageIndex]}`}
        alt={`${supplierName} logo`}
        className={cn(
          "object-contain transition-opacity duration-200",
          sizeClasses[size]
        )}
        onError={handleImageError}
        onLoad={() => {
          setImageLoaded(true)
          setImageError(false)
        }}
      />
      {/* Only show text if image failed to load and showText is true */}
      {imageError && showText && (
        <span className={cn("text-muted-foreground font-medium", textSizeClasses[size])}>
          {supplierName}
        </span>
      )}
    </div>
  )
}
