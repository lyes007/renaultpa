import { searchArticlesByOemNumber, getVehicleArticles } from './apify-api'

export interface ArticleDetails {
  articleId: number
  supplierId: number
  supplierName: string
  articleNo: string
  productGroupId: number
  productGroupName?: string
  eanNumbers?: string[]
  oemNumbers?: { brand: string; oem: string }[]
  media?: { imageMedia?: string; s3image?: string }[]
}

export interface EquivalenceResult {
  base: ArticleDetails
  oemReferences: { brand: string; oem: string }[]
  equivalents: ArticleDetails[]
  note?: string
}

// Normalize OEM number for better matching
function normalizeOem(oem: string): string {
  return oem.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

// Expand OEM variants (remove spaces, dots, dashes)
async function expandOemVariants(oem: string): Promise<string[]> {
  const normalized = normalizeOem(oem)
  const variants = new Set([oem, normalized])
  
  // Add common variant patterns
  if (oem.includes('.')) {
    variants.add(oem.replace(/\./g, ''))
  }
  if (oem.includes(' ')) {
    variants.add(oem.replace(/\s/g, ''))
  }
  if (oem.includes('-')) {
    variants.add(oem.replace(/-/g, ''))
  }
  
  return Array.from(variants)
}

// Search for articles by OEM number
async function searchByOem(oem: string, countryId: number = 253): Promise<ArticleDetails[]> {
  try {
    console.log(`[Equivalence] Searching OEM: ${oem}`)
    const response = await searchArticlesByOemNumber(oem, countryId)
    
    console.log(`[Equivalence] Response for OEM ${oem}:`, response)
    
    if (response.error || !response.data) {
      console.warn(`No results for OEM ${oem}:`, response.error)
      return []
    }

    // Handle different response structures
    let articles: any[] = []
    if (Array.isArray(response.data)) {
      // For OEM search, response.data is directly an array of articles
      articles = response.data
    }

    console.log(`[Equivalence] Found ${articles.length} articles for OEM ${oem}`)

    // Map to our ArticleDetails interface
    return articles.map((article: any) => ({
      articleId: article.articleId,
      supplierId: article.supplierId,
      supplierName: article.supplierName,
      articleNo: article.articleNo,
      productGroupId: article.productGroupId,
      productGroupName: article.productGroupName,
      eanNumbers: article.eanNumbers || [],
      media: article.media || [],
    }))
  } catch (error) {
    console.error(`Error searching OEM ${oem}:`, error)
    return []
  }
}

// Deduplicate articles with comprehensive duplicate detection
function dedupeArticles(items: ArticleDetails[], baseArticleId: number): ArticleDetails[] {
  const seenIds = new Set<number>()
  const seenKeys = new Set<string>()
  const out: ArticleDetails[] = []
  
  for (const item of items) {
    if (item.articleId === baseArticleId) continue // exclude self
    
    // Check by articleId first
    if (seenIds.has(item.articleId)) {
      continue
    }
    
    // Create composite key for supplier + article number
    const supplierArticleKey = `${item.supplierId}-${item.articleNo}`.toLowerCase()
    if (seenKeys.has(supplierArticleKey)) {
      console.log(`[Dedupe] Skipping duplicate: ${supplierArticleKey}`)
      continue
    }
    
    // Add to both tracking sets
    seenIds.add(item.articleId)
    seenKeys.add(supplierArticleKey)
    out.push(item)
  }
  
  return out
}

// Get vehicle-compatible articles
async function getVehicleArticlesSet(
  vehicleId: number, 
  productGroupId: number, 
  countryId: number = 253
): Promise<Set<number>> {
  try {
    const response = await getVehicleArticles(vehicleId, productGroupId, countryId)
    
    if (response.error || !response.data) {
      console.warn(`No vehicle articles found:`, response.error)
      return new Set()
    }

    const articleIds = new Set<number>()
    
    // Handle different response structures
    if (Array.isArray(response.data)) {
      response.data.forEach((item: any) => {
        if (item.articles && Array.isArray(item.articles)) {
          item.articles.forEach((article: any) => {
            if (article.articleId) {
              articleIds.add(article.articleId)
            }
          })
        }
      })
    }
    
    return articleIds
  } catch (error) {
    console.error('Error fetching vehicle articles:', error)
    return new Set()
  }
}

// Streaming function to build equivalents section
export async function* buildEquivalentsSectionStream(
  baseArticle: any,
  options: { 
    vehicleId?: number
    countryId?: number
  } = {}
): AsyncGenerator<{ type: 'article' | 'complete', data: any }> {
  const { vehicleId, countryId = 253 } = options

  // Log the base article for debugging
  console.log('[Equivalence] Base article data:', baseArticle)

  // Extract base article info
  const base: ArticleDetails = {
    articleId: baseArticle.articleId,
    supplierId: baseArticle.supplierId,
    supplierName: baseArticle.supplierName,
    articleNo: baseArticle.articleNo,
    productGroupId: baseArticle.productId || baseArticle.productGroupId,
    productGroupName: baseArticle.productGroupName,
    eanNumbers: baseArticle.eanNo?.eanNumbers ? [baseArticle.eanNo.eanNumbers] : [],
    oemNumbers: baseArticle.oemNo || [],
    media: baseArticle.allMedia || []
  }

  // Extract OEM numbers with debugging - only first OEM per manufacturer
  console.log('[Equivalence] OEM data:', baseArticle.oemNo)
  
  // Group by manufacturer and take only the first OEM from each
  const oemsByManufacturer = new Map<string, string>()
  base.oemNumbers?.forEach(o => {
    const brand = o.oemBrand || o.manufacturerName || 'Unknown'
    const oemNumber = o.oemDisplayNo || o.oemNumber || o.oem
    if (oemNumber && !oemsByManufacturer.has(brand)) {
      oemsByManufacturer.set(brand, oemNumber)
    }
  })
  
  const oems = Array.from(oemsByManufacturer.values())
  console.log('[Equivalence] Extracted OEMs (first per manufacturer):', oems)

  if (!oems.length) {
    yield { 
      type: 'complete', 
      data: { 
        equivalents: [], 
        note: "No OEM references were found for this article." 
      } 
    }
    return
  }

  const allEquivalents: ArticleDetails[] = []
  const seenArticles = new Set<number>()
  const seenArticleKeys = new Set<string>() // For more comprehensive duplicate detection

  // Search each OEM and yield results as they come
  for (const oem of oems) {
    console.log(`[Equivalence] Processing OEM: ${oem}`)
    const variants = await expandOemVariants(oem)
    
    for (const variant of variants) {
      const found = await searchByOem(variant, countryId)
      console.log(`[Equivalence] Found ${found.length} results for variant: ${variant}`)
      
      // First, deduplicate within this search response
      const responseDeduped = found.reduce((acc: any[], current: any) => {
        const existingIndex = acc.findIndex(item => 
          item.articleId === current.articleId || 
          (item.supplierId === current.supplierId && item.articleNo === current.articleNo)
        )
        if (existingIndex === -1) {
          acc.push(current)
        }
        return acc
      }, [])
      
      console.log(`[Equivalence] After response dedup: ${responseDeduped.length} unique articles`)
      
      // Then filter and apply global deduplication
      const filtered = responseDeduped
        .filter(x => x.productGroupId === base.productGroupId)
        .filter(x => x.articleId !== base.articleId)
        .filter(x => {
          // Check by articleId first
          if (seenArticles.has(x.articleId)) {
            console.log(`[Equivalence] Global duplicate by ID: ${x.articleId}`)
            return false
          }
          
          // Create a composite key for more thorough duplicate detection
          const articleKey = `${x.supplierId}-${x.articleNo}`.toLowerCase()
          if (seenArticleKeys.has(articleKey)) {
            console.log(`[Equivalence] Global duplicate by key: ${articleKey}`)
            return false
          }
          
          return true
        })
      
      // Add to seen sets and yield each new article
      for (const article of filtered) {
        seenArticles.add(article.articleId)
        seenArticleKeys.add(`${article.supplierId}-${article.articleNo}`.toLowerCase())
        allEquivalents.push(article)
        yield { type: 'article', data: article }
      }
    }
  }

  // Final completion signal
  yield { 
    type: 'complete', 
    data: { 
      equivalents: allEquivalents, 
      note: vehicleId ? undefined : "Compatibility depends on your exact vehicle model and year." 
    } 
  }
}

// Main function to build equivalents section (for backward compatibility)
export async function buildEquivalentsSection(
  baseArticle: any, // The article details from the main API call
  options: { 
    vehicleId?: number
    countryId?: number
  } = {}
): Promise<EquivalenceResult> {
  const { vehicleId, countryId = 253 } = options

  // Log the base article for debugging
  console.log('[Equivalence] Base article data:', baseArticle)

  // Extract base article info
  const base: ArticleDetails = {
    articleId: baseArticle.articleId,
    supplierId: baseArticle.supplierId,
    supplierName: baseArticle.supplierName,
    articleNo: baseArticle.articleNo,
    productGroupId: baseArticle.productId || baseArticle.productGroupId,
    productGroupName: baseArticle.productGroupName,
    eanNumbers: baseArticle.eanNo?.eanNumbers ? [baseArticle.eanNo.eanNumbers] : [],
    oemNumbers: baseArticle.oemNo || [],
    media: baseArticle.allMedia || []
  }

  // Extract OEM numbers with debugging - only first OEM per manufacturer
  console.log('[Equivalence] OEM data:', baseArticle.oemNo)
  
  // Group by manufacturer and take only the first OEM from each
  const oemsByManufacturer = new Map<string, string>()
  base.oemNumbers?.forEach(o => {
    const brand = o.oemBrand || o.manufacturerName || 'Unknown'
    const oemNumber = o.oemDisplayNo || o.oemNumber || o.oem
    if (oemNumber && !oemsByManufacturer.has(brand)) {
      oemsByManufacturer.set(brand, oemNumber)
    }
  })
  
  const oems = Array.from(oemsByManufacturer.values())
  console.log('[Equivalence] Extracted OEMs (first per manufacturer):', oems)
  
  // Always build OEM references for display (even if we can't search with them)
  const oemReferences = base.oemNumbers?.map(o => ({
    brand: o.oemBrand || o.manufacturerName || 'Unknown',
    oem: o.oemDisplayNo || o.oemNumber || o.oem || 'N/A'
  })) || []

  if (!oems.length) {
    return {
      base,
      oemReferences,
      equivalents: [],
      note: oemReferences.length > 0 ? 
        "OEM references found, but couldn't search for equivalents." :
        "No OEM references were found for this article."
    }
  }

  // Search equivalents by OEM (with variant expansion)
  const candidates: ArticleDetails[] = []
  
  console.log(`[Equivalence] Searching ${oems.length} OEMs for equivalents`)
  
  for (const oem of oems) {
    console.log(`[Equivalence] Processing OEM: ${oem}`)
    const variants = await expandOemVariants(oem)
    console.log(`[Equivalence] OEM variants:`, variants)
    
    for (const variant of variants) {
      const found = await searchByOem(variant, countryId)
      console.log(`[Equivalence] Found ${found.length} results for variant: ${variant}`)
      
      // Keep only items with same product group
      const filtered = found.filter(x => 
        x.productGroupId === base.productGroupId
      )
      console.log(`[Equivalence] After product group filter: ${filtered.length} results`)
      candidates.push(...filtered)
    }
  }
  
  console.log(`[Equivalence] Total candidates before dedup: ${candidates.length}`)

  // Deduplicate
  let equivalents = dedupeArticles(candidates, base.articleId)

  // Optional fitment filter
  if (vehicleId && base.productGroupId) {
    try {
      const fitSet = await getVehicleArticlesSet(vehicleId, base.productGroupId, countryId)
      if (fitSet.size > 0) {
        equivalents = equivalents.filter(x => fitSet.has(x.articleId))
      }
    } catch (error) {
      console.warn('Vehicle fitment check failed:', error)
    }
  }

  // Sort by supplier name, then article number
  equivalents.sort((a, b) => {
    const supplierCompare = (a.supplierName || "").localeCompare(b.supplierName || "")
    if (supplierCompare !== 0) return supplierCompare
    return (a.articleNo || "").localeCompare(b.articleNo || "")
  })

  // Limit results for performance
  equivalents = equivalents.slice(0, 20)

  return {
    base,
    oemReferences,
    equivalents,
    note: vehicleId ? undefined : "Compatibility depends on your exact vehicle model and year."
  }
}
