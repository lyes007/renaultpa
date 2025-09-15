"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, TrendingDown, ShoppingCart, Eye } from "lucide-react"
import { useCountry } from "@/contexts/country-context"
import { useVehicle } from "@/contexts/vehicle-context"
import { searchArticlesByNumberFrench } from "@/lib/apify-api"
import { getStockDataBatch, getStockStatus, type StockData } from "@/lib/stock-data"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { SupplierLogo } from "@/components/supplier-logo"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { getSupplierLogoInfo } from "@/lib/supplier-logos"

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

export function SaleSection() {
  const router = useRouter()
  const { selectedCountry } = useCountry()
  const { setArticleInfo } = useVehicle()
  const [saleArticles, setSaleArticles] = useState<SaleArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [suppliersWithLogos, setSuppliersWithLogos] = useState<Set<string>>(new Set())

  // Parse CSV data and get random references
  const parseCSVAndGetRandomRefs = async (): Promise<string[]> => {
    try {
      const response = await fetch('/stock/Article_Imprime1.csv')
      
      if (!response.ok) {
        console.error('Failed to fetch CSV:', response.status, response.statusText)
        return []
      }
      
      const csvText = await response.text()
      const lines = csvText.split('\n').filter(line => line.trim())
      
      // Skip header row and parse data
      const stockItems: StockItem[] = []
      for (let i = 1; i < Math.min(lines.length, 100); i++) { // Limit to first 100 lines for testing
        const line = lines[i]
        if (!line.trim()) continue
        
        // Parse CSV line (handle commas in quoted fields)
        const columns = line.split(',')
        if (columns.length >= 7) {
          const code = columns[0]?.trim()
          const designation = columns[1]?.trim()
          const stock = parseInt(columns[2]?.trim() || '0')
          const prixVenteTTC = parseFloat(columns[6]?.trim() || '0')
          
          // Only include items that are in stock (stock > 0) and have a valid price
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
      
      console.log(`Found ${stockItems.length} items in stock`)
      
      // Get 6 random items from in-stock items
      const shuffled = stockItems.sort(() => 0.5 - Math.random())
      const randomCodes = shuffled.slice(0, 6).map(item => item.code)
      
      return randomCodes
    } catch (error) {
      console.error('Error parsing CSV:', error)
      return []
    }
  }

  // Load sale articles
  useEffect(() => {
    const loadSaleArticles = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Get random article references from CSV
        const randomRefs = await parseCSVAndGetRandomRefs()
        
        if (randomRefs.length === 0) {
          setError('Aucun article trouvé dans le stock')
          return
        }

        // Search for articles using Apify API with French language
        const searchPromises = randomRefs.map(ref => 
          searchArticlesByNumberFrench(ref, selectedCountry.id)
        )
        
        const responses = await Promise.allSettled(searchPromises)
        const articles: SaleArticle[] = []
        
        responses.forEach((response, index) => {
          if (response.status === 'fulfilled' && !response.value.error) {
            const data = response.value.data as any
            
            // Handle the correct API response structure
            if (Array.isArray(data)) {
              data.forEach((searchResult: any) => {
                if (searchResult?.articles && Array.isArray(searchResult.articles)) {
                  searchResult.articles.forEach((article: any) => {
                    // Generate random sale prices (10-50% discount)
                    const discountPercent = Math.floor(Math.random() * 40) + 10 // 10-50%
                    const originalPrice = Math.random() * 200 + 50 // Random price between 50-250
                    const salePrice = originalPrice * (1 - discountPercent / 100)
                    
                    articles.push({
                      articleId: article.articleId,
                      articleNo: article.articleNo,
                      articleProductName: article.articleProductName,
                      supplierName: article.supplierName,
                      supplierId: article.supplierId,
                      imageLink: article.imageLink || '',
                      imageMedia: article.imageMedia || '',
                      s3image: article.s3image || '',
                      originalPrice,
                      salePrice,
                      discount: discountPercent
                    })
                  })
                }
              })
            }
          }
        })
        
        // Limit to 6 articles and add stock data
        const limitedArticles = articles.slice(0, 6)
        
        if (limitedArticles.length === 0) {
          // Create mock data for testing (all in stock)
          const mockArticles: SaleArticle[] = [
            {
              articleId: 1,
              articleNo: 'MOCK001',
              articleProductName: 'Filtre à air moteur',
              supplierName: 'MANN-FILTER',
              supplierId: 1,
              imageLink: '/placeholder.svg',
              imageMedia: '/placeholder.svg',
              s3image: '/placeholder.svg',
              originalPrice: 25.99,
              salePrice: 18.99,
              discount: 27,
              stockData: {
                inStock: true,
                stock: 5,
                prixVenteTTC: 18.99,
                prixVenteHT: 15.83
              }
            },
            {
              articleId: 2,
              articleNo: 'MOCK002',
              articleProductName: 'Plaquettes de frein avant',
              supplierName: 'BREMBO',
              supplierId: 2,
              imageLink: '/placeholder.svg',
              imageMedia: '/placeholder.svg',
              s3image: '/placeholder.svg',
              originalPrice: 45.50,
              salePrice: 32.99,
              discount: 28,
              stockData: {
                inStock: true,
                stock: 3,
                prixVenteTTC: 32.99,
                prixVenteHT: 27.49
              }
            },
            {
              articleId: 3,
              articleNo: 'MOCK003',
              articleProductName: 'Amortisseur avant',
              supplierName: 'MONROE',
              supplierId: 3,
              imageLink: '/placeholder.svg',
              imageMedia: '/placeholder.svg',
              s3image: '/placeholder.svg',
              originalPrice: 89.99,
              salePrice: 64.99,
              discount: 28,
              stockData: {
                inStock: true,
                stock: 2,
                prixVenteTTC: 64.99,
                prixVenteHT: 54.16
              }
            }
          ]
          setSaleArticles(mockArticles)
        } else {
          setSaleArticles(limitedArticles)
          
          // Load stock data in background
          try {
            const productCodes = limitedArticles.map(article => article.articleNo)
            const stockDataMap = await getStockDataBatch(productCodes)
            
            const articlesWithStock = limitedArticles.map(article => ({
              ...article,
              stockData: stockDataMap.get(article.articleNo) || null
            }))
            
            setSaleArticles(articlesWithStock)
          } catch (stockError) {
            console.error('Error loading stock data:', stockError)
          }
        }
        
      } catch (error) {
        console.error('Error loading sale articles:', error)
        setError('Erreur lors du chargement des promotions')
      } finally {
        setLoading(false)
      }
    }

    loadSaleArticles()
  }, [selectedCountry.id])

  const handleViewDetails = (article: SaleArticle) => {
    setArticleInfo({
      articleId: article.articleId,
      vehicleName: 'Promotion spéciale',
      categoryName: 'Ventes flash'
    })
    router.push('/product-details')
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Chargement des promotions...</span>
        </div>
      </div>
    )
  }

  if (error || saleArticles.length === 0) {
    return (
      <div className="p-4">
        <div className="text-center py-6">
          <Tag className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            {error || 'Aucune promotion disponible pour le moment'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-border/30 bg-gradient-to-r from-red-50/50 to-orange-50/50">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Ventes Flash</h3>
              <p className="text-xs text-muted-foreground">Promotions limitées • En stock</p>
            </div>
          </div>
          <Badge variant="destructive" className="text-xs animate-pulse">
            PROMO
          </Badge>
        </div>

        {/* Articles Panorama */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border">
          {saleArticles.map((article, index) => {
            // Use the same image logic as products page
            const s3IsValid = article.s3image && article.s3image.toLowerCase().includes('fsn1.your-objectstorage.com')
            const image = (s3IsValid ? article.s3image : (article.imageMedia || article.imageLink || ''))
            
            // Get stock status using the proper function from stock-data library
            const stockStatus = article.stockData ? 
              getStockStatus(article.stockData.stock) : 
              { text: 'Sur commande', color: '#F59E0B', isInStock: false, priority: 2 }
            
            // Determine CSS class for stock badge
            const getStockBadgeClass = (status: any) => {
              if (status.priority === 1) return 'in-stock'
              return 'out-of-stock'
            }
            
            return (
              <div 
                key={`${article.articleId}-${index}`}
                onClick={() => handleViewDetails(article)}
                className="flex-shrink-0 w-64 bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer group" 
                style={{ borderColor: "#D1B8B9" }}
              >
                {/* Discount Badge */}
                <div className="relative">
                  <Badge 
                    variant="destructive" 
                    className="absolute top-2 right-2 z-10 text-xs px-2 py-1 h-6"
                  >
                    -{article.discount}%
                  </Badge>
                  
                  {/* Product Image - Same as products page */}
                  <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                    {image ? (
                      <img 
                        src={image} 
                        alt={article.articleProductName} 
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" 
                      />
                    ) : (
                      <div className="text-4xl opacity-50">📦</div>
                    )}
                  </div>
                </div>
                
                {/* Product Info - Same structure as products page */}
                <div className="p-4 space-y-2">
                  <div className="text-sm font-semibold line-clamp-2" title={article.articleProductName} style={{ color: "#201A1A" }}>
                    {article.articleProductName}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <SupplierLogo 
                      supplierName={article.supplierName} 
                      size="small" 
                      onLogoLoad={(hasLogo) => {
                        setSuppliersWithLogos(prev => {
                          const newSet = new Set(prev)
                          if (hasLogo) {
                            newSet.add(article.supplierName)
                          } else {
                            newSet.delete(article.supplierName)
                          }
                          return newSet
                        })
                      }}
                    />
                    {!suppliersWithLogos.has(article.supplierName) && (
                      <div className="text-xs" style={{ color: "#B16C70" }}>{article.supplierName}</div>
                    )}
                  </div>
                  
                  <div className="text-xs" style={{ color: "#B16C70" }}>Ref: {article.articleNo}</div>
                  
                  {/* Price and Stock Information - Same as products page */}
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-red-600">
                        {article.salePrice.toFixed(2)} TND
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {article.originalPrice.toFixed(2)} TND
                      </span>
                    </div>
                    <span 
                      className={`stock-badge ${getStockBadgeClass(stockStatus)}`}
                    >
                      {stockStatus.text}
                    </span>
                  </div>
                  
                  {/* Add to Cart Button - Same as products page */}
                  <div className="flex justify-center mt-3">
                    <AddToCartButton
                      articleId={article.articleId}
                      articleName={article.articleProductName}
                      articleNo={article.articleNo}
                      supplierName={article.supplierName}
                      price={article.salePrice}
                      stockData={article.stockData}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
