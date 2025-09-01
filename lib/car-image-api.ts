interface CarImageResult {
  url: string
  thumbnail: string
  title: string
    source: string
  width?: number
  height?: number
}

interface CarImageResponse {
  images?: CarImageResult[]
  query?: string
  error?: string
  source?: string
}

/**
 * Search for car images using Wikimedia Commons
 * @param query Search query (e.g., "Renault Clio IV")
 * @returns Promise with image results or error
 */
export async function searchCarImagesWikimedia(query: string): Promise<{ data?: CarImageResult[], error?: string }> {
  try {
    console.log('[WikimediaAPI] Searching for car images:', query)
    
    const response = await fetch(`/api/wikimedia-image?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data: CarImageResponse = await response.json()
    
    if (data.error) {
      console.error('[WikimediaAPI] API returned error:', data.error)
      return { error: data.error }
    }

    if (data.images && data.images.length > 0) {
      // Convert Wikimedia format to our CarImageResult format
      const convertedImages = data.images.map((img: any) => ({
        url: img.url,
        thumbnail: img.thumburl || img.url, // Use thumburl if available, otherwise full URL
        title: img.title,
        source: 'Wikimedia Commons',
        width: img.width,
        height: img.height
      }))
      
      console.log(`[WikimediaAPI] Found ${convertedImages.length} images for: ${query}`)
      return { data: convertedImages }
    }

    return { error: 'No images found' }
    
  } catch (error) {
    console.error('[WikimediaAPI] Error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to search for car images'
    }
  }
}

/**
 * Search for car images using DuckDuckGo image search (fallback)
 * @param query Search query (e.g., "Renault Clio IV")
 * @returns Promise with image results or error
 */
export async function searchCarImagesDDG(query: string): Promise<{ data?: CarImageResult[], error?: string }> {
  try {
    console.log('[DuckDuckGoAPI] Searching for car images:', query)
    
    const response = await fetch(`/api/car-image?query=${encodeURIComponent(query)}`)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }

    const data: CarImageResponse = await response.json()
    
    if (data.error) {
      console.error('[DuckDuckGoAPI] API returned error:', data.error)
      return { error: data.error }
    }

    if (data.images && data.images.length > 0) {
      console.log(`[DuckDuckGoAPI] Found ${data.images.length} images for: ${query}`)
      return { data: data.images }
    }

    return { error: 'No images found' }
    
  } catch (error) {
    console.error('[DuckDuckGoAPI] Error:', error)
    return {
      error: error instanceof Error ? error.message : 'Failed to search for car images'
    }
  }
}

/**
 * Get the best car image from search results with URL validation
 * @param query Search query
 * @returns Promise with the best validated image result
 */
export async function getBestCarImage(query: string): Promise<{ data?: CarImageResult, error?: string }> {
  // Try Wikimedia first
  const wikimediaResult = await searchCarImagesWikimedia(query)
  
  if (wikimediaResult.data && wikimediaResult.data.length > 0) {
    console.log(`[CarImageAPI] Success with Wikimedia`)
    return { data: wikimediaResult.data[0] }
  }
  
  // Fallback to DuckDuckGo
  console.log(`[CarImageAPI] Wikimedia failed, trying DuckDuckGo fallback`)
  const ddgResult = await searchCarImagesDDG(query)
  
  if (ddgResult.error) {
    return { error: ddgResult.error }
  }

  if (ddgResult.data && ddgResult.data.length > 0) {
    console.log(`[DuckDuckGoAPI] Validating ${ddgResult.data.length} image URLs...`)
    
    // Find the first working image with validation
    const workingImage = await findWorkingImageResult(ddgResult.data)
    
    if (workingImage) {
      return { data: workingImage }
    } else {
      console.log('[DuckDuckGoAPI] No accessible images found after validation')
      return { error: 'No accessible images found' }
    }
  }

  return { error: 'No images found' }
}

/**
 * Enhanced car image search using Wikimedia Commons (primary) with DuckDuckGo fallback
 * @param manufacturerName Car manufacturer (e.g., "Renault")
 * @param modelName Car model (e.g., "Clio IV") 
 * @param year Optional year for more specific results
 * @returns Promise with image results
 */
export async function searchEnhancedCarImages(
  manufacturerName: string, 
  modelName: string, 
  year?: string
): Promise<{ data?: CarImageResult[], error?: string }> {
  
  // Clean the model name to remove engine specifications and technical details
  const cleanModelName = modelName
    .replace(/\b\d+\.\d+\s?(L|l|liters?|litres?)\b/gi, '') // Remove engine sizes like "1.6L", "2.0 liters"
    .replace(/\b\d+\s?(cv|ch|hp|bhp|ps)\b/gi, '') // Remove power specs like "150 CV", "200 HP"
    .replace(/\b(tce|dci|hdi|tdi|tfsi|fsi|gdi|crdi|cdti|blue|eco|sport|rs|gt|gti|gtd)\b/gi, '') // Remove engine codes
    .replace(/\b(automatic|manual|cvt|dsg|multitronic)\b/gi, '') // Remove transmission types
    .replace(/\b(4wd|awd|fwd|rwd|4x4|4x2)\b/gi, '') // Remove drivetrain specs
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()

  console.log(`[CarImageAPI] Original model: "${modelName}" → Cleaned: "${cleanModelName}"`)
  
  // Create enhanced search queries with fallbacks
  const queries = [
    // Primary query: clean manufacturer + model
    `${manufacturerName} ${cleanModelName}`,
    // Fallback: manufacturer + model + car
    `${manufacturerName} ${cleanModelName} car`,
    // Fallback with original model name if cleaning was too aggressive
    cleanModelName !== modelName ? `${manufacturerName} ${modelName}` : null,
    // Last resort: just manufacturer + basic model name
    `${manufacturerName} ${cleanModelName.split(' ')[0]}`
  ].filter(Boolean).filter((query, index, arr) => arr.indexOf(query) === index) // Remove nulls and duplicates

  console.log('[CarImageAPI] Enhanced search queries:', queries)

  // Try Wikimedia first for each query
  for (const query of queries) {
    console.log(`[CarImageAPI] Trying Wikimedia with: "${query}"`)
    const wikimediaResult = await searchCarImagesWikimedia(query)
    
    if (wikimediaResult.data && wikimediaResult.data.length > 0) {
      console.log(`[CarImageAPI] Success with Wikimedia query: "${query}"`)
      return wikimediaResult
    }
    
    console.log(`[CarImageAPI] No Wikimedia results for: "${query}"`)
  }

  // Fallback to DuckDuckGo if Wikimedia fails for all queries
  console.log('[CarImageAPI] Wikimedia failed for all queries, trying DuckDuckGo fallback')
  
  for (const query of queries) {
    console.log(`[CarImageAPI] Trying DuckDuckGo with: "${query}"`)
    const ddgResult = await searchCarImagesDDG(query)
    
    if (ddgResult.data && ddgResult.data.length > 0) {
      console.log(`[CarImageAPI] Success with DuckDuckGo query: "${query}"`)
      return ddgResult
    }
    
    console.log(`[CarImageAPI] No DuckDuckGo results for: "${query}"`)
  }

  return { error: 'No images found from any source for any search variation' }
}
