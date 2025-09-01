interface ImageSearchResult {
  title: string
  url: string
  descriptionurl: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
}

/**
 * Search for car images using multiple sources including DuckDuckGo-style search
 * @param brand - Car brand (e.g., "Renault")
 * @param model - Car model (e.g., "Clio")
 * @param generation - Optional generation info
 * @returns Promise with image URL and metadata
 */
export async function searchCarImages(
  brand: string, 
  model: string, 
  generation?: string
): Promise<ImageSearchResult | null> {
  try {
    // Construct search queries with fallbacks
    const searchQueries = [
      `${brand} ${model}${generation ? ` ${generation}` : ''} car`,
      `${brand} ${model} vehicle`,
      `${brand} ${model}`,
      `${brand} car`
    ]

    console.log(`[ImageSearch] Searching for: ${brand} ${model}`)

    // Try multiple image sources
    for (const searchQuery of searchQueries) {
      try {
        // Method 1: Try DuckDuckGo Instant Answer API
        const duckduckgoResult = await searchDuckDuckGo(searchQuery)
        if (duckduckgoResult) {
          console.log(`[ImageSearch] Found DuckDuckGo image:`, duckduckgoResult)
          return duckduckgoResult
        }

        // Method 2: Try Unsplash API (free, no auth required for basic usage)
        const unsplashResult = await searchUnsplash(searchQuery)
        if (unsplashResult) {
          console.log(`[ImageSearch] Found Unsplash image:`, unsplashResult)
          return unsplashResult
        }

        // Method 3: Try a curated car image database fallback
        const fallbackResult = getCuratedCarImage(brand, model)
        if (fallbackResult) {
          console.log(`[ImageSearch] Using curated image:`, fallbackResult)
          return fallbackResult
        }

      } catch (error) {
        console.warn(`[ImageSearch] Error with query "${searchQuery}":`, error)
        continue
      }
    }

    // Final fallback: Lorem Picsum with seed
    const picsumResult = await searchPicsum(brand, model)
    if (picsumResult) {
      console.log(`[ImageSearch] Using Picsum final fallback:`, picsumResult)
      return picsumResult
    }

    console.log(`[ImageSearch] No suitable image found for: ${brand} ${model}`)
    return null
  } catch (error) {
    console.error('[ImageSearch] Error fetching car image:', error)
    return null
  }
}

/**
 * Search DuckDuckGo's Instant Answer API for images
 */
async function searchDuckDuckGo(query: string): Promise<ImageSearchResult | null> {
  try {
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null
    
    const data = await response.json()
    
    // Check if there's an image in the response
    if (data.Image && data.Image.trim() !== '') {
      return {
        title: data.Heading || query,
        url: data.Image,
        descriptionurl: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`,
        thumbnail: {
          source: data.Image,
          width: 400,
          height: 300
        }
      }
    }
  } catch (error) {
    console.log('[ImageSearch] DuckDuckGo API not available:', error)
  }
  return null
}

/**
 * Search Unsplash for car images (free API, no auth required for basic usage)
 */
async function searchUnsplash(query: string): Promise<ImageSearchResult | null> {
  try {
    // Unsplash Source API - provides random images based on search terms
    const searchUrl = `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`
    
    // Test if the image exists by making a HEAD request
    const response = await fetch(searchUrl, { method: 'HEAD' })
    
    if (response.ok) {
      return {
        title: `${query} - Car Image`,
        url: searchUrl,
        descriptionurl: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
        thumbnail: {
          source: searchUrl,
          width: 800,
          height: 600
        }
      }
    }
  } catch (error) {
    console.log('[ImageSearch] Unsplash not available:', error)
  }
  return null
}

/**
 * Generate a placeholder car image using Lorem Picsum
 */
async function searchPicsum(brand: string, model: string): Promise<ImageSearchResult | null> {
  try {
    // Use a seed based on brand and model for consistent images
    const seed = brand.toLowerCase() + model.toLowerCase()
    const imageUrl = `https://picsum.photos/seed/${seed}/800/600`
    
    return {
      title: `${brand} ${model} - Car Image`,
      url: imageUrl,
      descriptionurl: 'https://picsum.photos',
      thumbnail: {
        source: imageUrl,
        width: 800,
        height: 600
      }
    }
  } catch (error) {
    console.log('[ImageSearch] Picsum not available:', error)
  }
  return null
}

/**
 * Get curated car images for major brands/models
 */
function getCuratedCarImage(brand: string, model: string): ImageSearchResult | null {
  const brandLower = brand.toLowerCase()
  const modelLower = model.toLowerCase()
  
  // Curated high-quality car images from public sources
  const curatedImages: Record<string, Record<string, string>> = {
    'renault': {
      'clio': 'https://images.unsplash.com/photo-1549399760-3fc7edc1a684?w=800&h=600&fit=crop',
      'megane': 'https://images.unsplash.com/photo-1553051092-68d0d9e88b3e?w=800&h=600&fit=crop',
      'duster': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'twingo': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
      'default': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop'
    },
    'dacia': {
      'sandero': 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      'duster': 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
      'logan': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'default': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop'
    },
    'nissan': {
      'micra': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
      'juke': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop',
      'qashqai': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&h=600&fit=crop',
      'default': 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop'
    }
  }
  
  const brandImages = curatedImages[brandLower]
  if (brandImages) {
    const imageUrl = brandImages[modelLower] || brandImages['default']
    
    return {
      title: `${brand} ${model}`,
      url: imageUrl,
      descriptionurl: `https://unsplash.com/s/photos/${brand}-${model}`,
      thumbnail: {
        source: imageUrl,
        width: 800,
        height: 600
      }
    }
  }
  
  // Generic car fallback
  return {
    title: `${brand} ${model} - Car`,
    url: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop',
    descriptionurl: 'https://unsplash.com/s/photos/car',
    thumbnail: {
      source: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop',
      width: 800,
      height: 600
    }
  }
}

/**
 * Validate if an image URL is accessible and valid
 */
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'HEAD'
    })
    return response.ok && response.headers.get('content-type')?.startsWith('image/')
  } catch (error) {
    return false
  }
}

/**
 * Get alternative search terms for better image matching
 */
export function getCarSearchVariants(brand: string, model: string): string[] {
  const variants = [
    `${brand} ${model} car`,
    `${brand} ${model} vehicle`,
    `${brand} ${model}`,
    `${model} ${brand}`,
    model,
    brand
  ]

  // Add common generation/version patterns
  const commonSuffixes = ['II', 'III', 'IV', 'V', '2', '3', '4', '5', 'generation']
  commonSuffixes.forEach(suffix => {
    variants.push(`${brand} ${model} ${suffix}`)
    variants.push(`${model} ${suffix}`)
  })

  return [...new Set(variants)] // Remove duplicates
}
