"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/hooks/use-cart"
import { useCountry } from "@/contexts/country-context"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { SupplierLogo } from "@/components/ui/supplier-logo"
import { buildEquivalentsSectionStream, type EquivalenceResult, type ArticleDetails } from "@/lib/equivalence-service"
import { 
  ArrowLeft, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Package, 
  Shield, 
  Truck, 
  Info,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Zap,
  Award,
  Clock,
  Phone,
  MessageCircle
} from "lucide-react"

interface ArticleDetailsProps {
  articleId: number
  onBack?: () => void
}

interface ArticleData {
  articleId: number
  articleNo: string
  articleProductName: string
  supplierName: string
  supplierId: number
  imageLink?: string
  imageMedia?: string
  s3image?: string
  s3ImageLink?: string
  allMedia?: Array<{
    articleMediaType: string
    articleMediaFileName: string
    supplierId: number
    mediaInformation: string
    imageLink: string
    imageMedia: string
    s3image?: string
  }>
  allSpecifications?: Array<{
    specificationName: string
    specificationValue: string
    specificationUnit?: string
  }>
  eanNo?: { eanNumbers: string }
  oemNo?: Array<{
    oemNumber: string
    manufacturerName: string
  }>
  articleInfo?: {
    weight?: number
    dimensions?: string
    warranty?: string
}
}

interface StockStatus {
  inStock: boolean
  stockLevel: number
  price: number
  priceHT: number
}

export function ArticleDetails({ articleId, onBack }: ArticleDetailsProps) {
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [stockStatus, setStockStatus] = useState<StockStatus | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [equivalenceData, setEquivalenceData] = useState<EquivalenceResult | null>(null)
  const [equivalenceLoading, setEquivalenceLoading] = useState(false)
  const [streamingEquivalents, setStreamingEquivalents] = useState<ArticleDetails[]>([])
  const [streamingComplete, setStreamingComplete] = useState(false)
  
  const { addItem } = useCart()
  const { selectedCountry } = useCountry()

  // Build S3-only image gallery
  const images = useMemo(() => {
    if (!article) return []
    
    console.log(`[ArticleDetails] Building S3-only image gallery for article ${article.articleId}`)
    console.log(`[ArticleDetails] Primary image fields:`, {
      s3image: article.s3image,
      s3ImageLink: article.s3ImageLink,
      imageLink: article.imageLink,
      imageMedia: article.imageMedia
    })
    
    const s3ImageUrls: string[] = []
    
    // Helper function to check if URL is S3 image (not PDF)
    const isS3ImageUrl = (url: string) => {
      if (!url) return false
      const lowercaseUrl = url.toLowerCase()
      const isS3 = lowercaseUrl.includes('fsn1.your-objectstorage.com')
      const isImage = lowercaseUrl.includes('.webp') || 
                     lowercaseUrl.includes('.jpg') || 
                     lowercaseUrl.includes('.jpeg') || 
                     lowercaseUrl.includes('.png') || 
                     lowercaseUrl.includes('.gif') ||
                     (lowercaseUrl.includes('/images/') && !lowercaseUrl.includes('.pdf'))
      return isS3 && isImage
    }
    
    // First, collect all s3image URLs from media (these are the best quality)
    if (article.allMedia && article.allMedia.length > 0) {
      console.log(`[ArticleDetails] Processing ${article.allMedia.length} media items for S3 images`)
      article.allMedia.forEach((media, index) => {
        console.log(`[ArticleDetails] Media ${index}:`, {
          s3image: media.s3image,
          imageLink: media.imageLink,
          imageMedia: media.imageMedia,
          fileName: media.articleMediaFileName,
          mediaType: media.articleMediaType
        })
        
        // Only add S3 image URLs that are actual images
        if (media.s3image && isS3ImageUrl(media.s3image)) {
          console.log(`[ArticleDetails] ✅ Adding S3 media image:`, media.s3image)
          s3ImageUrls.push(media.s3image)
        }
      })
    }
    
    // Add primary S3 images only
    if (article.s3image && isS3ImageUrl(article.s3image)) {
      console.log(`[ArticleDetails] ✅ Adding primary s3image:`, article.s3image)
      s3ImageUrls.unshift(article.s3image) // Add to beginning
    }
    if (article.s3ImageLink && isS3ImageUrl(article.s3ImageLink)) {
      console.log(`[ArticleDetails] ✅ Adding primary s3ImageLink:`, article.s3ImageLink)
      s3ImageUrls.push(article.s3ImageLink)
    }
    
    // Remove duplicates while preserving order
    const uniqueS3Images = Array.from(new Set(s3ImageUrls))
    console.log(`[ArticleDetails] Final S3-only image gallery (${uniqueS3Images.length} images):`, uniqueS3Images)
    
    if (uniqueS3Images.length === 0) {
      console.warn(`[ArticleDetails] ⚠️ No S3 images found for article ${article.articleId}`)
    }
    
    return uniqueS3Images
  }, [article])

  useEffect(() => {
    loadArticleDetails()
  }, [articleId])

  const loadArticleDetails = async () => {
    try {
      setLoading(true)
      setError(null)

              // Fetch article details, specifications, and media in parallel
        const [detailsResponse, specsResponse, mediaResponse] = await Promise.all([
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-details-by-article-id',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleId
            })
          }),
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-specification-details-by-article-id',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleId
            })
          }),
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-all-media',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleId
            })
          })
        ])

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch article details')
      }

      const [detailsData, specsData, mediaData] = await Promise.all([
        detailsResponse.json(),
        specsResponse.json(),
        mediaResponse.json()
      ])

      if (detailsData.length > 0 && detailsData[0].article) {
        const articleDetails = detailsData[0].article
        const specifications = specsData.length > 0 ? specsData[0] : null
        
        // Process media data - could be single object or array
        let allMedia: any[] = []
        if (mediaData && mediaData.length > 0) {
          // If it's an array of media objects
          if (Array.isArray(mediaData)) {
            allMedia = mediaData.filter(media => media.s3image || media.imageLink || media.imageMedia)
          } else if (mediaData[0] && (mediaData[0].s3image || mediaData[0].imageLink || mediaData[0].imageMedia)) {
            // Single media object
            allMedia = [mediaData[0]]
          }
        }



        console.log(`[ArticleDetails] Raw article data from API:`, articleDetails)
        console.log(`[ArticleDetails] Processed media data:`, allMedia)
        
        const articleData = {
          ...articleDetails,
          // Ensure s3image field is properly mapped from API response
          s3image: articleDetails.s3image,
          allMedia: allMedia,
          allSpecifications: specifications?.articleAllSpecifications || [],
          eanNo: specifications?.articleEanNo || null,
          oemNo: specifications?.articleOemNo || []
        }
        
        setArticle(articleData)
        
        // Load stock data for this article
        if (articleDetails.articleNo) {
          loadStockData(articleDetails.articleNo)
        }
        
        // Load equivalence data
        loadEquivalenceData(articleData)
      } else {
        throw new Error('Article not found')
      }
    } catch (err) {
      console.error('[ArticleDetails] Error loading article:', err)
      setError(err instanceof Error ? err.message : 'Failed to load article details')
    } finally {
      setLoading(false)
    }
  }

  const loadStockData = async (articleNo: string) => {
    try {
      setStockLoading(true)
      
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ single: articleNo })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.stockStatus) {
          setStockStatus(data.stockStatus)
        }
      }
    } catch (error) {
      console.error('Error loading stock data:', error)
    } finally {
      setStockLoading(false)
    }
  }

  const loadEquivalenceData = async (articleData: any) => {
    try {
      setEquivalenceLoading(true)
      setStreamingEquivalents([])
      setStreamingComplete(false)
      
      console.log('[ArticleDetails] Loading equivalence for:', articleData)
      
      const stream = buildEquivalentsSectionStream(articleData, {
        countryId: selectedCountry.id,
        // vehicleId could be passed if available in context
      })
      
      for await (const result of stream) {
        if (result.type === 'article') {
          setStreamingEquivalents(prev => {
            // Additional safety check for duplicates in UI state
            const isDuplicate = prev.some(existing => 
              existing.articleId === result.data.articleId ||
              (existing.supplierId === result.data.supplierId && existing.articleNo === result.data.articleNo)
            )
            
            if (isDuplicate) {
              console.log(`[UI] Preventing duplicate: ${result.data.supplierId}-${result.data.articleNo}`)
              return prev
            }
            
            return [...prev, result.data]
          })
        } else if (result.type === 'complete') {
          setStreamingComplete(true)
          setEquivalenceData({
            base: result.data.base || {},
            oemReferences: [], // We're not showing this anymore
            equivalents: result.data.equivalents || [],
            note: result.data.note
          })
        }
      }
    } catch (error) {
      console.error('Error loading equivalence data:', error)
      setStreamingComplete(true)
    } finally {
      setEquivalenceLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!article) return
    
    const price = stockStatus?.price || 29.99 // Use real price or fallback to mock
    
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: price,
      quantity: quantity,
             image: article.s3image?.includes('fsn1.your-objectstorage.com') ? article.s3image : '',
      supplier: article.supplierName,
      articleNo: article.articleNo,
    })
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta))
  }

  const handleCall = () => {
    window.open('tel:50134993', '_self')
  }

  const handleWhatsApp = () => {
    if (!article) return
    const message = `Bonjour, je suis intéressé par cet article en rupture de stock:\n\nNom: ${article.articleProductName}\nRéférence: ${article.articleNo}\n\nPouvez-vous me dire si vous pouvez l'importer? Merci.`
    const whatsappUrl = `https://wa.me/21650134993?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Skeleton */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted/30 rounded-lg animate-pulse" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted/30 rounded-md animate-pulse" />
              ))}
            </div>
          </div>
          
          {/* Content Skeleton */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted/30 rounded-md animate-pulse" />
              <div className="h-6 bg-muted/30 rounded-md w-3/4 animate-pulse" />
              <div className="h-10 bg-muted/30 rounded-md w-1/2 animate-pulse" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-muted/30 rounded animate-pulse" />
              ))}
            </div>
          </div>
          </div>
          </div>
    )
  }

  if (error || !article) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Article non trouvé</h2>
            <p className="text-muted-foreground">
              {error || "L'article demandé n'existe pas ou n'est plus disponible."}
            </p>
            {onBack && (
              <Button onClick={onBack} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
            </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }



  const currentPrice = stockStatus?.price || 29.99
  const mockOriginalPrice = currentPrice * 1.3 // Create a mock original price for discount display
  const discount = stockStatus ? Math.round(((mockOriginalPrice - currentPrice) / mockOriginalPrice) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto article-details-mobile">
      {/* Desktop Back Button */}
      {onBack && (
        <div className="hidden sm:block mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="h-10 px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux résultats
          </Button>
        </div>
      )}

      <div className="mobile-detail-grid grid lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative mobile-gallery-main bg-gradient-to-br from-muted/30 to-muted/10 rounded-xl overflow-hidden aspect-square product-image-hover">
                         {images.length > 0 ? (
               <RobustProductImage
                 s3ImageLink={images[selectedImage]}
                 imageLink={undefined}
                 imageMedia={undefined}
                 alt={article.articleProductName}
                 className="w-full h-full object-contain transition-all duration-300"
                 showDebug={true}
               />
             ) : (
               <RobustProductImage
                 s3ImageLink={article.s3image?.includes('fsn1.your-objectstorage.com') ? article.s3image : undefined}
                 imageLink={undefined}
                 imageMedia={undefined}
                 alt={article.articleProductName}
                 className="w-full h-full object-contain"
                 showDebug={true}
               />
             )}
            
            {/* Image overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-10 w-10 p-0 bg-background/80 backdrop-blur-sm hover:bg-background"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Gallery navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 gallery-navigation-arrow bg-background/80 hover:bg-background border border-border rounded-full p-2"
                  aria-label="Image précédente"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 gallery-navigation-arrow bg-background/80 hover:bg-background border border-border rounded-full p-2"
                  aria-label="Image suivante"
                >
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 gallery-counter px-3 py-1 rounded-full text-xs font-medium">
                {selectedImage + 1} / {images.length}
              </div>
            )}

            {/* Discount badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white font-bold">
                  -{discount}%
                </Badge>
              </div>
            )}
          </div>

          {/* Enhanced Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Images ({images.length})
              </h4>
              <div className="mobile-thumbnail-strip">
                {/* Desktop: Show all thumbnails */}
                <div className="hidden sm:grid grid-cols-6 gap-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-md overflow-hidden border-2 thumbnail-transition ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                                             <RobustProductImage
                         s3ImageLink={image}
                         imageLink={undefined}
                         imageMedia={undefined}
                         alt={`${article.articleProductName} ${index + 1}`}
                         className="w-full h-full object-contain"
                       />
                    </button>
                  ))}
                </div>

                {/* Mobile: Horizontal scroll */}
                <div className="sm:hidden flex gap-2 overflow-x-auto pb-2 gallery-thumbnail-grid">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 thumbnail-transition ${
                        selectedImage === index 
                          ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                                             <RobustProductImage
                         s3ImageLink={image}
                         imageLink={undefined}
                         imageMedia={undefined}
                         alt={`${article.articleProductName} ${index + 1}`}
                         className="w-full h-full object-contain"
                       />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="mobile-product-title text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                  {article.articleProductName}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <SupplierLogo 
                    supplierName={article.supplierName}
                    size="md"
                    showText={true}
                  />
                  <Badge variant="outline" className="mobile-badge text-xs">
                    Réf: {article.articleNo}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(127 avis)</span>
            </div>
          </div>

          {/* Price */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
            <div>
                  <div className="flex items-baseline gap-3">
                    <span className="mobile-product-price text-3xl font-bold text-primary price-pulse">
                      {currentPrice.toFixed(2)} <span className="text-lg">TND</span>
                    </span>
                    {discount > 0 && (
                      <span className="text-lg text-muted-foreground line-through">
                        {mockOriginalPrice.toFixed(2)} TND
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Prix TTC • Livraison incluse
                  </p>
                </div>
                <div className="text-right">
                  {stockStatus ? (
                    stockStatus.inStock ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        En stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Rupture de stock
                      </Badge>
                    )
                  ) : stockLoading ? (
                    <Badge variant="secondary">
                      Vérification...
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Article non disponible
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Truck className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Livraison 24h</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Shield className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Garantie 2 ans</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Award className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Qualité OE</span>
            </div>
            <div className="mobile-feature-card flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
              <Zap className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="text-xs font-medium">Installation</span>
            </div>
              </div>
              
          {/* Quantity & Add to Cart */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Quantité</label>
                  <div className="mobile-quantity-controls flex items-center gap-1 bg-background border border-border rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mobile-quantity-button h-10 w-10 p-0"
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mobile-quantity-button h-10 w-10 p-0"
                      onClick={() => handleQuantityChange(1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  </div>

                {(() => {
                  const isOutOfStock = stockStatus && !stockStatus.inStock
                  const isNotInCatalog = !stockStatus
                  
                  if (isOutOfStock) {
                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            onClick={handleCall}
                            className="h-12 text-base font-semibold hover:bg-blue-50 hover:border-blue-300"
                            size="lg"
                            variant="outline"
                          >
                            <Phone className="h-5 w-5 mr-2" />
                            Appeler
                          </Button>
                          <Button 
                            onClick={handleWhatsApp}
                            className="h-12 text-base font-semibold hover:bg-green-50 hover:border-green-300"
                            size="lg"
                            variant="outline"
                          >
                            <MessageCircle className="h-5 w-5 mr-2" />
                            WhatsApp
                          </Button>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Article en rupture de stock - Contactez-nous pour vérifier la disponibilité
                          </p>
                        </div>
                      </div>
                    )
                  } else if (isNotInCatalog) {
                    return (
                      <div className="space-y-3">
                        <Button 
                          className="w-full h-12 text-base font-semibold"
                          size="lg"
                          disabled
                          variant="outline"
                        >
                          <AlertCircle className="h-5 w-5 mr-2" />
                          Article non disponible
                        </Button>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">
                            Cet article n'est pas disponible dans notre catalogue
                          </p>
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <Button 
                        onClick={handleAddToCart}
                        className="w-full h-12 text-base font-semibold"
                        size="lg"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        Ajouter au panier • {(currentPrice * quantity).toFixed(2)} TND
                      </Button>
                    )
                  }
                })()}

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-11">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                  <Button variant="outline" className="h-11">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
            </div>

      {/* Product Details Tabs */}
        <div className="mt-8 lg:mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-12 sm:h-auto">
              <TabsTrigger value="overview" className="mobile-tabs-trigger text-xs sm:text-sm">Aperçu</TabsTrigger>
              <TabsTrigger value="specs" className="mobile-tabs-trigger text-xs sm:text-sm">Spécifications</TabsTrigger>
              <TabsTrigger value="equivalence" className="mobile-tabs-trigger text-xs sm:text-sm">Équivalence</TabsTrigger>
              <TabsTrigger value="compatibility" className="mobile-tabs-trigger text-xs sm:text-sm">Compatibilité</TabsTrigger>
              <TabsTrigger value="delivery" className="mobile-tabs-trigger text-xs sm:text-sm">Livraison</TabsTrigger>
            </TabsList>

          <TabsContent value="overview" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Description du produit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Pièce de suspension de haute qualité conçue pour assurer une conduite confortable et sécurisée. 
                  Fabriquée selon les standards OE pour une compatibilité parfaite avec votre véhicule.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium">Caractéristiques principales</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>• Matériaux haute résistance</li>
                      <li>• Installation facile</li>
                      <li>• Testé en conditions extrêmes</li>
                      <li>• Certification ISO/TS 16949</li>
                    </ul>
                </div>

                  {article.eanNo && (
                <div className="space-y-2">
                      <h4 className="font-medium">Codes produit</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">EAN:</span>
                  <div className="flex items-center gap-2">
                            <code className="bg-muted px-2 py-1 rounded text-xs">
                              {article.eanNo.eanNumbers}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => copyToClipboard(article.eanNo?.eanNumbers || '')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                  </div>
                      </div>
                  </div>
                </div>
              )}
            </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specs" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
              Spécifications techniques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {article.allSpecifications && article.allSpecifications.length > 0 ? (
                  <div className="grid gap-3">
              {article.allSpecifications.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                        <span className="text-sm font-medium">{spec.specificationName}</span>
                        <span className="text-sm text-muted-foreground">
                          {spec.specificationValue}
                          {spec.specificationUnit && ` ${spec.specificationUnit}`}
                        </span>
                </div>
              ))}
            </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Aucune spécification technique disponible pour ce produit.
                  </p>
                )}
              </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="equivalence" className="mt-6 tab-content-enter">
              <Card className="mobile-detail-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Pièces équivalentes
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Articles de différents fournisseurs compatibles avec les mêmes références OEM
                  </p>
                </CardHeader>
                <CardContent>
                  {equivalenceLoading && streamingEquivalents.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Recherche des pièces équivalentes...</span>
                      </div>
                    </div>
                  ) : streamingEquivalents.length > 0 || streamingComplete ? (
                    <div className="space-y-4">

                      {/* Streaming Equivalent Parts */}
                      {streamingEquivalents.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">Articles équivalents</h3>
                            <Badge variant="secondary" className="text-xs">
                              {streamingEquivalents.length} trouvé{streamingEquivalents.length > 1 ? 's' : ''} {!streamingComplete && '...'}
                            </Badge>
                          </div>
                          
                          <div className="grid gap-3">
                            {streamingEquivalents.map((equivalent) => (
                              <div key={equivalent.articleId} className="flex items-center justify-between p-4 border border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                  <SupplierLogo 
                                    supplierName={equivalent.supplierName}
                                    size="sm"
                                    showText={false}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm">{equivalent.supplierName}</span>
                                      <Badge variant="outline" className="text-xs">
                                        Réf: {equivalent.articleNo}
                                      </Badge>
                                    </div>
                                    {equivalent.eanNumbers && equivalent.eanNumbers.length > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        EAN: {equivalent.eanNumbers[0]}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {equivalent.media && equivalent.media.length > 0 && (
                                    <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                                      <RobustProductImage
                                        s3ImageLink={equivalent.media[0].s3image}
                                        imageLink={equivalent.media[0].imageMedia}
                                        alt={equivalent.supplierName}
                                        className="w-full h-full object-cover"
                                        size="sm"
                                        showDebug={false}
                                      />
                                    </div>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => window.open(`/article/${equivalent.articleId}`, '_blank')}
                                    className="h-8"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    Voir
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {equivalenceData?.note && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-xs text-amber-800">
                                ⚠️ <strong>Note:</strong> {equivalenceData.note}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* No results message - only show when streaming is complete */}
                      {streamingComplete && streamingEquivalents.length === 0 && (
                        <div className="text-center py-8">
                          <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                          <p className="text-muted-foreground mb-2">Aucune pièce équivalente trouvée</p>
                          <p className="text-xs text-muted-foreground">
                            Cette pièce n'a pas d'équivalents disponibles dans notre catalogue.
                          </p>
                        </div>
                      )}

                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          💡 <strong>Info:</strong> Ces pièces sont des équivalents basés sur les références OEM. 
                          Elles sont conçues pour s'adapter aux mêmes véhicules que la pièce originale.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground mb-2">Erreur lors du chargement</p>
                      <p className="text-xs text-muted-foreground">
                        Impossible de charger les pièces équivalentes pour le moment.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

                     <TabsContent value="compatibility" className="mt-6 tab-content-enter">
            <div className="space-y-6">
              {/* OEM Numbers Section */}
              <Card className="mobile-detail-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Références OE / OEM
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Numéros de pièces d'origine constructeur compatibles
                  </p>
                </CardHeader>
                <CardContent>
                                    {article.oemNo && article.oemNo.length > 0 ? (
                    <div className="space-y-4">
                      {/* Header with count */}
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">
                          {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE trouvée{article.oemNo.length > 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center gap-2">
                          {article.oemNo.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() => {
                                const allRefs = article.oemNo.map(oem => `${oem.oemBrand}: ${oem.oemDisplayNo}`).join('\n')
                                copyToClipboard(allRefs)
                              }}
                              title="Copier toutes les références"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Tout copier
                            </Button>
                          )}
                          {article.oemNo.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              Défiler pour voir plus
                            </span>
                          )}
                        </div>
                      </div>

                      {/* OEM References */}
                      <div className="space-y-3 max-h-96 overflow-y-auto category-scroll">
                        {article.oemNo.map((oem, index) => (
                          <div key={index} className="border border-border/40 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <Award className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-sm">{oem.oemBrand || 'Constructeur'}</h4>
                                  <p className="text-xs text-muted-foreground">Référence OE</p>
                                </div>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                OE
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between bg-background/50 p-2 rounded-md border border-border/30">
                              <code className="text-xs font-mono font-medium text-foreground">
                                {oem.oemDisplayNo}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                onClick={() => copyToClipboard(oem.oemDisplayNo)}
                                title="Copier la référence"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Summary */}
                      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE compatible{article.oemNo.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                          Cette pièce remplace directement les références d'origine constructeur
                        </p>
            </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Info className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h4 className="font-medium mb-2">Aucune référence OE disponible</h4>
                      <p className="text-sm text-muted-foreground">
                        Les informations de compatibilité OE ne sont pas disponibles pour cette pièce
                      </p>

          </div>
        )}
      </CardContent>
    </Card>

              {/* Vehicle Compatibility Info */}
              <Card className="mobile-detail-section">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Informations de compatibilité
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">Garantie de compatibilité</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          Pièce garantie compatible selon les spécifications TecDoc
                        </p>
                      </div>
                      
                      <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          <span className="font-medium text-sm">Vérification recommandée</span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-400">
                          Vérifiez toujours la compatibilité avec votre véhicule avant commande
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 border border-border/40 rounded-lg">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Comment vérifier la compatibilité
                      </h5>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Comparez avec la référence d'origine de votre pièce</li>
                        <li>• Vérifiez le numéro VIN de votre véhicule</li>
                        <li>• Consultez le manuel technique de votre véhicule</li>
                        <li>• Contactez notre service technique en cas de doute</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-6 tab-content-enter">
            <Card className="mobile-detail-section">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Livraison et retours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-4">
                    <h4 className="font-medium">Options de livraison</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <Clock className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Livraison Express</p>
                          <p className="text-xs text-green-600">24h - Gratuite dès 50 TND</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                        <Truck className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Livraison Standard</p>
                          <p className="text-xs text-muted-foreground">2-3 jours - 5 TND</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Retours et garantie</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Retour gratuit sous 30 jours</p>
                      <p>• Garantie constructeur 2 ans</p>
                      <p>• Support technique inclus</p>
                      <p>• Pièce défectueuse ? Échange immédiat</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
            </div>
          </div>
  )
}