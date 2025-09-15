"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingDown, ShoppingCart, Eye } from "lucide-react"
import { useCountry } from "@/contexts/country-context"
import { useVehicle } from "@/contexts/vehicle-context"
import { searchArticlesByNumberFrench } from "@/lib/apify-api"
import { getStockStatus, type StockData } from "@/lib/stock-data"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { SupplierLogo } from "@/components/supplier-logo"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { SaleSectionSkeleton } from "@/components/ui/loading-skeleton"

// Cache for sale articles to prevent repeated API calls
const saleArticlesCache = new Map<string, SaleArticle[]>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface StockItem {
  code: string
  designation: string
  stock: number
  emplacement: string
  prixAchat: number
  prixVenteHT: number
  prixVenteTTC: number
}

interface SaleArticle {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  imageLink: string
  imageMedia: string
  s3image: string
  stockData?: StockData | null
  originalPrice: number
  salePrice: number
  discount: number
}

export const SaleSection = memo(function SaleSection() {
  const router = useRouter()
  const { selectedCountry } = useCountry()
  const { setArticleInfo } = useVehicle()
  const [saleArticles, setSaleArticles] = useState<SaleArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppliersWithLogos, setSuppliersWithLogos] = useState<Set<string>>(new Set())

  // Memoized CSV parsing function
  const parseCSVAndGetRandomRefs = useCallback(async (): Promise<string[]> => {
    try {
      const response = await fetch('/stock/Article_Imprime1.csv')
      
      if (!response.ok) {
        console.error('Failed to fetch CSV:', response.status, response.statusText)
        return []
      }
      
      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      // Skip header row and parse data - limit to first 30 lines for better performance
      const stockItems: StockItem[] = []
      for (let i = 1; i < Math.min(lines.length, 31); i++) {
        const line = lines[i]
        if (!line.trim()) continue
        
        const columns = line.split(',')
        if (columns.length >= 7) {
          const code = columns[0]?.trim()
          const designation = columns[1]?.trim()
          const stock = parseInt(columns[2]?.trim() || '0')
          const prixVenteTTC = parseFloat(columns[6]?.trim() || '0')
          
          if (code && designation && stock > 0 && prixVenteTTC > 0) {
            stockItems.push({
              code,
              designation,
              stock,
              emplacement: columns[3]?.trim() || '',
              prixAchat: parseFloat(columns[4]?.trim() || '0'),
              prixVenteHT: parseFloat(columns[5]?.trim() || '0'),
              prixVenteTTC
            })
          }
        }
      }
      
      // Get only 3 random items to reduce API calls significantly
      const shuffled = stockItems.sort(() => 0.5 - Math.random())
      const randomCodes = shuffled.slice(0, 3).map(item => item.code)
      
      return randomCodes
    } catch (error) {
      console.error('Error parsing CSV:', error)
      return []
    }
  }, [])

  // Optimized article loading with caching and reduced API calls
  const loadSaleArticles = useCallback(async () => {
    const cacheKey = `sale-articles-${selectedCountry.id}`
    const cached = saleArticlesCache.get(cacheKey)
    
    // Check if we have valid cached data
    if (cached && cached.length > 0) {
      setSaleArticles(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const randomRefs = await parseCSVAndGetRandomRefs()
      
      if (randomRefs.length === 0) {
        setError('Aucun article trouvé dans le stock')
        return
      }

      // Process articles sequentially to reduce API load
      const articles: SaleArticle[] = []
      
      for (const ref of randomRefs) {
        try {
          const response = await searchArticlesByNumberFrench(ref, selectedCountry.id)
          
          if (response && !response.error && Array.isArray(response.data)) {
            const data = response.data
            
            data.forEach((searchResult: any) => {
              if (searchResult?.articles && Array.isArray(searchResult.articles)) {
                // Take only the first article from each result to reduce processing
                const article = searchResult.articles[0]
                if (article) {
                  const discountPercent = Math.floor(Math.random() * 40) + 10 // 10-50%
                  const originalPrice = Math.random() * 200 + 50 // Random price between 50-250
                  const salePrice = originalPrice * (1 - discountPercent / 100)
                  
                  articles.push({
                    articleId: article.articleId,
                    articleNo: article.articleNo,
                    articleProductName: article.articleProductName,
                    supplierName: article.supplierName,
                    supplierId: article.supplierId,
                    imageLink: article.imageLink || "",
                    imageMedia: article.articleMediaFileName || "",
                    s3image: article.s3image || "",
                    stockData: {
                      stock: Math.floor(Math.random() * 50) + 1, // Random stock
                      inStock: true
                    },
                    originalPrice,
                    salePrice,
                    discount: discountPercent
                  })
                }
              }
            })
          }
        } catch (error) {
          console.error(`Error fetching article ${ref}:`, error)
        }
        
        // Add delay between API calls to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      if (articles.length === 0) {
        setError('Aucun article trouvé pour les promotions')
        return
      }

      const finalArticles = articles.slice(0, 3) // Limit to 3 articles
      setSaleArticles(finalArticles)
      
      // Cache the results
      saleArticlesCache.set(cacheKey, finalArticles)
      
      // Clear cache after duration
      setTimeout(() => {
        saleArticlesCache.delete(cacheKey)
      }, CACHE_DURATION)
      
    } catch (error) {
      console.error('Error loading sale articles:', error)
      setError('Erreur lors du chargement des promotions')
    } finally {
      setLoading(false)
    }
  }, [selectedCountry, parseCSVAndGetRandomRefs])

  // Load articles with delay to prevent blocking initial page load
  useEffect(() => {
    if (selectedCountry) {
      const timeoutId = setTimeout(loadSaleArticles, 3000) // 3s delay to let page load first
      return () => clearTimeout(timeoutId)
    }
  }, [selectedCountry, loadSaleArticles])

  // Memoize the supplier logo handler to prevent unnecessary re-renders
  const handleSupplierLogoLoad = useCallback((supplierName: string, hasLogo: boolean) => {
    setSuppliersWithLogos(prev => {
      const newSet = new Set(prev)
      if (hasLogo) {
        newSet.add(supplierName)
      } else {
        newSet.delete(supplierName)
      }
      return newSet
    })
  }, [])

  const handleArticleClick = (article: SaleArticle) => {
    setArticleInfo({
      articleId: article.articleId,
      articleNo: article.articleNo,
      articleProductName: article.articleProductName,
      supplierName: article.supplierName,
      supplierId: article.supplierId,
      imageLink: article.imageLink,
      imageMedia: article.imageMedia,
      s3image: article.s3image,
      stockData: article.stockData
    })
    router.push(`/article/${article.articleId}`)
  }

  if (loading) {
    return <SaleSectionSkeleton />
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Promotions</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (saleArticles.length === 0) {
    return null
  }

  return (
    <section className="py-12 bg-gradient-to-r from-red-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Promotions</h2>
          <p className="text-gray-600">Découvrez nos offres spéciales</p>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {saleArticles.map((article) => (
            <div
              key={article.articleId}
              className="flex-shrink-0 w-64 bg-white rounded-lg border hover:shadow-md transition-all duration-200"
              style={{ borderColor: "#D1B8B9" }}
            >
              <Card className="h-full">
                <CardContent className="p-4 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative mb-4">
                    <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                      <RobustProductImage
                        s3ImageLink={article.s3image}
                        imageLink={article.imageLink}
                        imageMedia={article.imageMedia}
                        alt={article.articleProductName}
                        className="w-full h-full object-cover"
                        size="lg"
                      />
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                      -{article.discount}%
                    </Badge>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {article.articleProductName}
                    </h3>
                    
                    {/* Supplier */}
                    <div className="flex items-center gap-2 mb-3">
                      <SupplierLogo
                        supplierName={article.supplierName}
                        size="small"
                        onLogoLoad={(hasLogo) => handleSupplierLogoLoad(article.supplierName, hasLogo)}
                      />
                      {!suppliersWithLogos.has(article.supplierName) && (
                        <div className="text-xs" style={{ color: "#B16C70" }}>
                          {article.supplierName}
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">
                          {article.salePrice.toFixed(2)} TND
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {article.originalPrice.toFixed(2)} TND
                        </span>
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mb-4">
                      <span className="stock-badge in-stock">
                        {getStockStatus(article.stockData?.stock || 0).text}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleArticleClick(article)}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <AddToCartButton
                        articleId={article.articleId}
                        articleNo={article.articleNo}
                        articleProductName={article.articleProductName}
                        supplierName={article.supplierName}
                        supplierId={article.supplierId}
                        imageLink={article.imageLink}
                        imageMedia={article.imageMedia}
                        s3image={article.s3image}
                        stockData={article.stockData}
                        price={article.salePrice}
                        size="sm"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
})
