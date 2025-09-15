"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useVehicle } from "@/contexts/vehicle-context"
import { useCountry } from "@/contexts/country-context"
import { getArticles } from "@/lib/apify-api"
import { getStockDataBatch, getStockStatus, getStockPriority, type StockData } from "@/lib/stock-data"
import { SupplierLogo } from "@/components/supplier-logo"
import { AddToCartButton } from "@/components/add-to-cart-button"
import { CartDrawer } from "@/components/cart-drawer"
import { Pagination } from "@/components/pagination"
import { SupplierDropdown } from "@/components/supplier-dropdown"
import "../categories/categories.css"

interface Article {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  productId: number
  articleMediaType: number
  articleMediaFileName: string
  imageLink: string
  imageMedia: string
  s3image: string
  stockData?: StockData | null
}

// Map fast categories to TecDoc product group IDs
const getFastCategoryProductGroupId = (categoryId: string): number => {
  const categoryMapping: Record<string, number> = {
    'filtre': 10, // Filters
    'battery': 11, // Batteries
    'brakes': 12, // Brake system
    'air-conditioning': 13, // Air conditioning
    'engine': 14, // Engine
    'steering': 15, // Steering
    'damping': 16, // Suspension
    'interior': 17, // Interior equipment
  }
  
  return categoryMapping[categoryId] || 10 // Default to filters if not found
}

export default function ProductsPage() {
  const router = useRouter()
  const { vehicleInfo, categoryInfo, setArticleInfo } = useVehicle()
  const { selectedCountry } = useCountry()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [stockLoading, setStockLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState<string>("")
  const [suppliersWithLogos, setSuppliersWithLogos] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 24

  useEffect(() => {
    if (!vehicleInfo) {
      router.push('/')
      return
    }
    
    // Check if we have a fast category selected (from the new workflow)
    const selectedFastCategory = localStorage.getItem('selectedFastCategory')
    if (!categoryInfo && !selectedFastCategory) {
      router.push('/categories')
      return
    }
  }, [vehicleInfo, categoryInfo, router])

  // Load articles (preserving Apify API input structure)
  useEffect(() => {
    const load = async () => {
      if (!vehicleInfo) return
      
      // Check if we have a fast category selected
      const selectedFastCategory = localStorage.getItem('selectedFastCategory')
      if (!categoryInfo && !selectedFastCategory) return
      
      setLoading(true)
      setError(null)
      try {
        const manufacturerId = vehicleInfo.selectionMethod === 'manual' ? (vehicleInfo.manufacturerId || 0) : (vehicleInfo.manuId || 0)
        const vehicleId = vehicleInfo.selectionMethod === 'manual' ? (vehicleInfo.vehicleId || 0) : (vehicleInfo.carId || 0)
        
        let productGroupId: number
        
        if (categoryInfo) {
          // Original workflow: use categoryInfo
          productGroupId = Number.parseInt(categoryInfo.categoryId)
        } else if (selectedFastCategory) {
          // New workflow: use fast category mapping
          const fastCategoryData = JSON.parse(selectedFastCategory)
          productGroupId = getFastCategoryProductGroupId(fastCategoryData.id)
        } else {
          setError('Aucune catégorie sélectionnée')
          setArticles([])
          return
        }
        
        if (Number.isNaN(productGroupId)) {
          setError('ID de catégorie invalide')
          setArticles([])
          return
        }
        const response = await getArticles(manufacturerId, vehicleId, productGroupId, selectedCountry.id)
        if (response.error) {
          setError(response.error)
          setArticles([])
          return
        }
        const data = (response.data as any)?.[0]?.articles || []
        
        // Show articles immediately without stock data
        setArticles(data)
        setLoading(false)
        
        // Load stock data in the background
        setStockLoading(true)
        try {
          const productCodes = data.map((article: Article) => article.articleNo)
          const stockDataMap = await getStockDataBatch(productCodes)
          
          // Update articles with stock data
          const articlesWithStock = data.map((article: Article) => ({
            ...article,
            stockData: stockDataMap.get(article.articleNo) || null
          }))
          
          setArticles(articlesWithStock)
        } catch (stockError) {
          console.error('Error loading stock data:', stockError)
          // Keep articles without stock data
        } finally {
          setStockLoading(false)
        }
      } catch (e) {
        console.error('Error loading articles:', e)
        setError('Erreur lors du chargement des articles')
      } finally {
        setLoading(false)
        setStockLoading(false)
      }
    }
    load()
  }, [vehicleInfo, categoryInfo, selectedCountry.id])

  const filteredAndSorted = useMemo(() => {
    let list = [...articles]
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      list = list.filter(a =>
        a.articleProductName?.toLowerCase().includes(q) ||
        a.articleNo?.toLowerCase().includes(q) ||
        a.supplierName?.toLowerCase().includes(q)
      )
    }
    if (selectedSupplier) {
      list = list.filter(a => a.supplierName === selectedSupplier)
    }
    list.sort((a, b) => {
      // First sort by stock availability (priority)
      const stockPriorityA = getStockPriority(a.stockData)
      const stockPriorityB = getStockPriority(b.stockData)
      
      if (stockPriorityA !== stockPriorityB) {
        return stockPriorityA - stockPriorityB
      }
      
      // Within the same stock group, sort by logo availability
      const aHasLogo = suppliersWithLogos.has(a.supplierName)
      const bHasLogo = suppliersWithLogos.has(b.supplierName)
      
      if (aHasLogo !== bHasLogo) {
        return aHasLogo ? -1 : 1 // Products with logos come first
      }
      
      // If both have same stock status and logo availability, sort by name
      return a.articleProductName.localeCompare(b.articleProductName)
    })
    return list
  }, [articles, searchTerm, selectedSupplier, suppliersWithLogos])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedSupplier])

  // Calculate pagination
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedArticles = filteredAndSorted.slice(startIndex, endIndex)

  const suppliers = useMemo(() => {
    return Array.from(new Set(articles.map(a => a.supplierName))).sort()
  }, [articles])

  const handleBackToCategories = () => router.push('/categories')
  const handleBackToHome = () => router.push('/')

  const handleViewDetails = (articleId: number) => {
    const vehicleName = vehicleInfo?.selectionMethod === 'manual'
      ? `${vehicleInfo.manufacturerName} ${vehicleInfo.modelName}`
      : (vehicleInfo?.carName || '')
    
    const categoryName = selectedFastCategory 
      ? JSON.parse(selectedFastCategory).name 
      : (categoryInfo?.categoryName || '')
    
    setArticleInfo({
      articleId,
      vehicleName,
      categoryName
    })
    router.push('/product-details')
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }


  // Check if we have required data
  const selectedFastCategory = localStorage.getItem('selectedFastCategory')
  if (!vehicleInfo || (!categoryInfo && !selectedFastCategory)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">Informations manquantes</p>
              <button onClick={handleBackToHome} className="inline-flex items-center gap-2 rounded-md px-4 py-2 border hover:bg-muted">
                <span>←</span>
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const vehicleTitle = vehicleInfo.selectionMethod === 'manual'
    ? `${vehicleInfo.manufacturerName} ${vehicleInfo.modelName}`
    : (vehicleInfo.carName || '')
  const vehicleSubtitle = vehicleInfo.selectionMethod === 'manual'
    ? vehicleInfo.typeEngineName
    : (vehicleInfo.vehicleTypeDescription || '')

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFEFE" }}>
      <Header />
      <div className="bg-white border-b shadow-sm" style={{ borderColor: "#D1B8B9" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B16C70" }}>
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "#BE141E" }}
            >
              <span>Accueil</span>
            </button>
            <span>→</span>
            {selectedFastCategory ? (
              <>
                <span className="font-medium" style={{ color: "#201A1A" }}>
                  {JSON.parse(selectedFastCategory).name}
                </span>
              </>
            ) : (
              <>
                <button
                  onClick={handleBackToCategories}
                  className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: "#BE141E" }}
                >
                  <span>Catégories</span>
                </button>
                <span>→</span>
                <span className="font-medium" style={{ color: "#201A1A" }}>
                  {categoryInfo?.categoryName}
                </span>
              </>
            )}
          </nav>

          {/* Vehicle & Category Summary */}
          <div className="rounded-xl p-4 text-white mb-4" style={{ backgroundColor: "#BE141E" }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-lg font-bold mb-1">{vehicleTitle}</h1>
                <div className="flex items-center gap-3 text-sm opacity-90">
                  <span>{vehicleSubtitle}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ID: {vehicleInfo.selectionMethod === 'manual' ? vehicleInfo.vehicleId : vehicleInfo.carId}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold mb-1">
                  {selectedFastCategory ? JSON.parse(selectedFastCategory).name : categoryInfo?.categoryName}
                </div>
                <div className="text-xs opacity-80">
                  Catégorie ID: {selectedFastCategory ? getFastCategoryProductGroupId(JSON.parse(selectedFastCategory).id) : categoryInfo?.categoryId}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Search Bar and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center mb-6">
            <div className="search-container flex-1 max-w-md">
              <form className="form">
                <button type="button">
                  <svg
                    width="17"
                    height="16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-labelledby="search"
                  >
                    <path
                      d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9"
                      stroke="currentColor"
                      strokeWidth="1.333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                </button>
                <input
                  className="input"
                  placeholder="Rechercher un article..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                />
                {searchTerm && (
                  <button className="reset" type="reset" onClick={() => setSearchTerm("")}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </form>
            </div>
            
            <SupplierDropdown
              suppliers={suppliers}
              selectedSupplier={selectedSupplier}
              onSupplierChange={setSelectedSupplier}
              suppliersWithLogos={suppliersWithLogos}
            />
          </div>

          {/* Articles */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="rounded-xl p-6 border" style={{ backgroundColor: "#FEFEFE", borderColor: "#BE141E" }}>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "#BE141E" }}
                >
                  <span className="text-white text-xl">⚠</span>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#201A1A" }}>
                  Erreur de chargement
                </h3>
                <p className="text-sm" style={{ color: "#B16C70" }}>
                  {error}
                </p>
              </div>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-12">
              <div className="rounded-xl p-6 border" style={{ backgroundColor: "#FEFEFE", borderColor: "#D1B8B9" }}>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "#D1B8B9" }}
                >
                  <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#201A1A" }}>
                  Aucun article trouvé
                </h3>
                <p className="text-sm" style={{ color: "#B16C70" }}>
                  Essayez de modifier vos critères de recherche
                </p>
              </div>
            </div>
          ) : (
            <div>
              {stockLoading && (
                <div className="flex justify-center items-center py-4 mb-4">
                  <div className="text-sm" style={{ color: "#B16C70" }}>
                    Chargement des prix et stocks...
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedArticles.map((a) => {
                // Match logic from ArticlesList/ModernArticlesList: prefer valid S3 image when available
                const s3IsValid = a.s3image && a.s3image.toLowerCase().includes('fsn1.your-objectstorage.com')
                const image = (s3IsValid ? a.s3image : (a.imageMedia || a.imageLink || ''))
                
                // Get price and stock information
                const price = a.stockData?.prixVenteTTC ? `${a.stockData.prixVenteTTC.toFixed(2)} TND` : "---"
                const stockStatus = a.stockData ? getStockStatus(a.stockData.stock) : { text: 'Sur commande', color: '#F59E0B', isInStock: false, priority: 2 }
                
                // Determine CSS class for stock badge
                const getStockBadgeClass = (status: any) => {
                  if (status.priority === 1) return 'in-stock'
                  return 'out-of-stock'
                }
                
                return (
                  <div 
                    key={a.articleId} 
                    onClick={() => handleViewDetails(a.articleId)}
                    className="bg-white rounded-lg border hover:shadow-md transition-all duration-200 cursor-pointer" 
                    style={{ borderColor: "#D1B8B9" }}
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center p-4">
                      {image ? (
                        <img src={image} alt={a.articleProductName} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-4xl opacity-50">📦</div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="text-sm font-semibold line-clamp-2" title={a.articleProductName} style={{ color: "#201A1A" }}>
                        {a.articleProductName}
                      </div>
                      <div className="flex items-center gap-2">
                        <SupplierLogo 
                          supplierName={a.supplierName} 
                          size="small" 
                          onLogoLoad={(hasLogo) => {
                            setSuppliersWithLogos(prev => {
                              const newSet = new Set(prev)
                              if (hasLogo) {
                                newSet.add(a.supplierName)
                              } else {
                                newSet.delete(a.supplierName)
                              }
                              return newSet
                            })
                          }}
                        />
                        {!suppliersWithLogos.has(a.supplierName) && (
                          <div className="text-xs" style={{ color: "#B16C70" }}>{a.supplierName}</div>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: "#B16C70" }}>Ref: {a.articleNo}</div>
                      
                      {/* Price and Stock Information */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm product-price">
                          {price}
                        </span>
                        <span 
                          className={`stock-badge ${getStockBadgeClass(stockStatus)}`}
                        >
                          {stockStatus.text}
                        </span>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <div className="flex justify-center mt-3">
                        <AddToCartButton
                          articleId={a.articleId}
                          articleName={a.articleProductName}
                          articleNo={a.articleNo}
                          supplierName={a.supplierName}
                          price={a.stockData?.prixVenteTTC}
                          stockData={a.stockData}
                          image={image}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
              </div>
              
              {/* Pagination */}
              {filteredAndSorted.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredAndSorted.length}
                />
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      <Footer />
      <CartDrawer />
    </div>
  )
}
