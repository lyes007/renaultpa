"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { useVehicle } from "@/contexts/vehicle-context"
import { useCountry } from "@/contexts/country-context"
import { useCart } from "@/hooks/use-cart"
import { buildEquivalentsSectionStream, type EquivalenceResult, type ArticleDetails } from "@/lib/equivalence-service"
import { ArrowLeft, Home, ChevronRight, Heart, Share2, Minus, Plus, Phone, MessageCircle, Copy, Check, Info, Star, Truck, Shield, Award, Zap, Package, AlertTriangle, Clock, MapPin, RotateCcw, Wrench, Settings, FileText, Users, HelpCircle, Image, Video, File, Lightbulb, Link, ExternalLink } from "lucide-react"
import { SupplierLogo } from "@/components/supplier-logo"

// Custom WhatsApp Icon Component
const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
  </svg>
)
import "../categories/categories.css"

interface StockStatus {
  inStock: boolean
  stockLevel: number
  price: number
  priceHT: number
}

export default function ProductDetailsPage() {
  const router = useRouter()
  const { articleInfo } = useVehicle()
  const { selectedCountry } = useCountry()
  const { addItem } = useCart()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [article, setArticle] = useState<any | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState("equivalence")
  const [stockStatus, setStockStatus] = useState<StockStatus | null>(null)
  const [stockLoading, setStockLoading] = useState(false)
  const [equivalenceData, setEquivalenceData] = useState<EquivalenceResult | null>(null)
  const [equivalenceLoading, setEquivalenceLoading] = useState(false)
  const [streamingEquivalents, setStreamingEquivalents] = useState<ArticleDetails[]>([])
  const [streamingComplete, setStreamingComplete] = useState(false)
  const [allMedia, setAllMedia] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)

  useEffect(() => {
    if (!articleInfo) {
      router.push('/')
      return
    }
  }, [articleInfo, router])

  const handleBack = () => router.back()

  const handleBackToHome = () => router.push('/')

  // Load article details, specs and media (preserve Apify input params)
  useEffect(() => {
    const load = async () => {
      if (!articleInfo) return
      try {
        setLoading(true)
        setError(null)

        const [detailsRes, specsRes, mediaRes] = await Promise.all([
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-details-by-article-id',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleInfo.articleId,
            })
          }),
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-specification-details-by-article-id',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleInfo.articleId,
            })
          }),
          fetch('/api/apify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              selectPageType: 'get-article-all-media',
              langId: 6,
              countryId: selectedCountry.id,
              articleId: articleInfo.articleId,
            })
          })
        ])

        if (!detailsRes.ok) throw new Error('Failed to fetch article details')

        const [detailsData, specsData, mediaData] = await Promise.all([
          detailsRes.json(),
          specsRes.json(),
          mediaRes.json(),
        ])

        const details = detailsData?.[0]?.article
        if (!details) throw new Error('Article non trouvé')

        // Process media to S3 images only
        const isS3ImageUrl = (url: string) => {
          if (!url) return false
          const u = url.toLowerCase()
          const isS3 = u.includes('fsn1.your-objectstorage.com')
          const isImg = u.includes('.webp') || u.includes('.jpg') || u.includes('.jpeg') || u.includes('.png') || u.includes('.gif')
          return isS3 && isImg
        }

        let mediaList: any[] = []
        if (Array.isArray(mediaData)) {
          mediaList = mediaData
        } else if (mediaData?.[0]) {
          mediaList = [mediaData[0]]
        }

        const s3Images: string[] = []
        mediaList.forEach((m) => {
          if (m?.s3image && isS3ImageUrl(m.s3image)) s3Images.push(m.s3image)
        })
        if (details?.s3image && isS3ImageUrl(details.s3image)) s3Images.unshift(details.s3image)
        if (details?.s3ImageLink && isS3ImageUrl(details.s3ImageLink)) s3Images.push(details.s3ImageLink)

        const uniqueImages = Array.from(new Set(s3Images))

        const specs = specsData?.[0] || {}

        const articleCombined = {
          ...details,
          allSpecifications: specs.articleAllSpecifications || [],
          eanNo: specs.articleEanNo || null,
          oemNo: specs.articleOemNo || [],
        }

        setArticle(articleCombined)
        setImages(uniqueImages)
        setSelectedImage(0)
        
        // Load stock data for this article
        if (details.articleNo) {
          loadStockData(details.articleNo)
        }
        
        // Load equivalence data
        loadEquivalenceData(articleCombined)
        
        // Load all media separately for gallery
        loadAllMedia(articleInfo.articleId)
      } catch (e) {
        console.error('Error loading article details:', e)
        setError(e instanceof Error ? e.message : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [articleInfo, selectedCountry.id])

  const loadAllMedia = async (articleId: number) => {
    try {
      setMediaLoading(true)
      
      const mediaResponse = await fetch('/api/apify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectPageType: 'get-article-all-media',
          langId: 6,
          countryId: selectedCountry.id,
          articleId: articleId
        })
      })

      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        
        // Process media data - could be single object or array
        let processedMedia: any[] = []
        if (mediaData && mediaData.length > 0) {
          if (Array.isArray(mediaData)) {
            processedMedia = mediaData.filter(media => 
              media.s3image || media.imageLink || media.imageMedia
            )
          } else if (mediaData[0] && (mediaData[0].s3image || mediaData[0].imageLink || mediaData[0].imageMedia)) {
            processedMedia = [mediaData[0]]
          }
        }
        
        console.log('[ProductDetails] Loaded media:', processedMedia)
        setAllMedia(processedMedia)
      }
    } catch (error) {
      console.error('Error loading all media:', error)
    } finally {
      setMediaLoading(false)
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
      
      const stream = buildEquivalentsSectionStream(articleData, {
        countryId: selectedCountry.id,
      })
      
      for await (const result of stream) {
        if (result.type === 'article') {
          setStreamingEquivalents(prev => {
            const isDuplicate = prev.some(existing => 
              existing.articleId === result.data.articleId ||
              (existing.supplierId === result.data.supplierId && existing.articleNo === result.data.articleNo)
            )
            
            if (isDuplicate) {
              return prev
            }
            
            return [...prev, result.data]
          })
        } else if (result.type === 'complete') {
          setStreamingComplete(true)
          setEquivalenceData({
            base: result.data.base || {},
            oemReferences: [],
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
    
    if (!stockStatus?.price) {
      return
    }
    
    addItem({
      articleId: article.articleId,
      name: article.articleProductName,
      price: stockStatus.price,
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

  if (!articleInfo) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FEFEFE" }}>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center py-20">
            <div className="bg-white rounded-2xl p-6 shadow-lg border" style={{ borderColor: "#D1B8B9" }}>
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#BE141E" }}
              >
                <Package className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#201A1A" }}>
                Article non trouvé
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#B16C70" }}>
                L'article demandé n'existe pas ou n'est plus disponible
              </p>
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center gap-2 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: "#BE141E" }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFEFE" }}>
      <Header />
      <div className="bg-white border-b shadow-sm" style={{ borderColor: "#D1B8B9" }}>
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B16C70" }}>
              <button
                onClick={handleBack}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "#BE141E" }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Retour aux produits</span>
              </button>
              <ChevronRight className="h-4 w-4" />
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: "#BE141E" }}
              >
                <Home className="h-4 w-4" />
              <span>Accueil</span>
              </button>
              <ChevronRight className="h-4 w-4" />
              <span>Catégories</span>
              {articleInfo.categoryName && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{articleInfo.categoryName}</span>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium" style={{ color: "#201A1A" }}>
                Détails du produit
              </span>
            </nav>

          {/* Vehicle Context (if available) */}
          {articleInfo.vehicleName && (
              <div className="rounded-xl p-4 text-white mb-4" style={{ backgroundColor: "#BE141E" }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h1 className="text-lg font-bold mb-1">Article compatible</h1>
                    <div className="flex items-center gap-3 text-sm opacity-90">
                      <span>{articleInfo.vehicleName}</span>
                    </div>
                  </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="spinner"></div>
                </div>
            ) : error || !article ? (
              <div className="max-w-md mx-auto text-center py-12">
                <div className="rounded-xl p-6 border" style={{ backgroundColor: "#FEFEFE", borderColor: "#BE141E" }}>
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: "#BE141E" }}
                  >
                    <AlertTriangle className="h-6 w-6 text-white" />
              </div>
                  <h3 className="text-base font-semibold mb-2" style={{ color: "#201A1A" }}>
                    Erreur de chargement
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "#B16C70" }}>
                    {error || "L'article demandé n'existe pas ou n'est plus disponible."}
                  </p>
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: "#BE141E" }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Retour</span>
                  </button>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
                {/* Enhanced Media Gallery */}
                <div className="space-y-4">
                  {/* Main Image Display */}
                  <div className="relative bg-white rounded-xl overflow-hidden aspect-square border" style={{ borderColor: "#D1B8B9" }}>
                    {images.length > 0 ? (
                      <img 
                        src={images[selectedImage]} 
                        alt={article.articleProductName} 
                        className="w-full h-full object-contain transition-all duration-300 p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ color: "#B16C70" }}>
                        <Package className="h-24 w-24" />
                      </div>
                    )}
                    
                    {/* Image overlay actions */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg border transition-all duration-200"
                        style={{ borderColor: "#D1B8B9" }}
                        onClick={() => setIsFavorite(!isFavorite)}
                      >
                        <Heart className={`h-4 w-4 mx-auto ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                      </button>
                      <button className="h-10 w-10 p-0 bg-white/90 backdrop-blur-sm hover:bg-white rounded-lg border transition-all duration-200" style={{ borderColor: "#D1B8B9" }}>
                        <Share2 className="h-4 w-4 mx-auto" style={{ color: "#B16C70" }} />
                      </button>
                    </div>

                    {/* Gallery navigation arrows */}
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : images.length - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border rounded-full p-2 transition-all duration-200"
                          style={{ borderColor: "#D1B8B9" }}
                          aria-label="Image précédente"
                        >
                          <ArrowLeft className="h-4 w-4" style={{ color: "#BE141E" }} />
                        </button>
                        <button
                          onClick={() => setSelectedImage(selectedImage < images.length - 1 ? selectedImage + 1 : 0)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white border rounded-full p-2 transition-all duration-200"
                          style={{ borderColor: "#D1B8B9" }}
                          aria-label="Image suivante"
                        >
                          <ChevronRight className="h-4 w-4" style={{ color: "#BE141E" }} />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium bg-white/90 border" style={{ borderColor: "#D1B8B9", color: "#201A1A" }}>
                        {selectedImage + 1} / {images.length}
                      </div>
                    )}

                    {/* Discount badge */}
                    {stockStatus && stockStatus.price && (
                      <div className="absolute top-4 left-4">
                        <span className="text-white font-bold px-2 py-1 rounded text-xs" style={{ backgroundColor: "#BE141E" }}>
                          -23%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Combined Media Gallery */}
                  {(() => {
                    // Helper function to check if URL is S3 image
                    const isS3ImageUrl = (url: string) => {
                      if (!url) return false
                      const lowercaseUrl = url.toLowerCase()
                      const isS3 = lowercaseUrl.includes('fsn1.your-objectstorage.com')
                      const isImage = lowercaseUrl.includes('.webp') || 
                                     lowercaseUrl.includes('.jpg') || 
                                     lowercaseUrl.includes('.jpeg') || 
                                     lowercaseUrl.includes('.png') || 
                                     lowercaseUrl.includes('.gif')
                      return isS3 && isImage
                    }

                    // Combine main images with all media images
                    const allGalleryImages = [...images]
                    
                    // Add additional media images that aren't already in the main gallery
                    allMedia.forEach(media => {
                      if (media.s3image && isS3ImageUrl(media.s3image) && !allGalleryImages.includes(media.s3image)) {
                        allGalleryImages.push(media.s3image)
                      }
                      if (media.imageMedia && !allGalleryImages.includes(media.imageMedia)) {
                        allGalleryImages.push(media.imageMedia)
                      }
                    })

                    const totalImages = allGalleryImages.length
                    const hasAdditionalMedia = allMedia.length > 0

                    return null
                  })()}
                </div>

                {/* Product Information */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ color: "#201A1A" }}>
                          {article.articleProductName}
                        </h1>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-sm font-medium" style={{ color: "#B16C70" }}>{article.supplierName}</span>
                          <span className="px-2 py-0.5 rounded border text-xs" style={{ borderColor: "#D1B8B9", color: "#201A1A" }}>
                            Réf: {article.articleNo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : ''}`} style={{ color: i >= 4 ? "#D1B8B9" : undefined }} />
                        ))}
                      </div>
                      <span className="text-sm" style={{ color: "#B16C70" }}>(127 avis)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="bg-white border rounded-lg p-4 sm:p-6" style={{ borderColor: "#D1B8B9" }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-3xl font-bold" style={{ color: "#BE141E" }}>
                            {stockStatus?.price ? `${stockStatus.price.toFixed(2)} TND` : "---"}
                          </span>
                          {stockStatus?.price && (
                            <span className="text-lg line-through" style={{ color: "#B16C70" }}>
                              {(stockStatus.price * 1.3).toFixed(2)} TND
                            </span>
                          )}
                        </div>
                        <p className="text-sm mt-1" style={{ color: "#B16C70" }}>
                          Prix TTC • Livraison incluse
                        </p>
                      </div>
                      <div className="text-right">
                        {stockStatus ? (
                          stockStatus.inStock ? (
                            <span className="px-2 py-1 rounded text-sm flex items-center gap-1" style={{ backgroundColor: "#D1FAE5", color: "#10B981" }}>
                              <Check className="h-3 w-3" />
                              En stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-sm flex items-center gap-1" style={{ backgroundColor: "#FEF3C7", color: "#F59E0B" }}>
                              <AlertTriangle className="h-3 w-3" />
                              Sur commande
                            </span>
                          )
                        ) : stockLoading ? (
                          <span className="px-2 py-1 rounded text-sm flex items-center gap-1" style={{ backgroundColor: "#D1B8B9", color: "#201A1A" }}>
                            <Clock className="h-3 w-3" />
                            Vérification...
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded text-sm flex items-center gap-1" style={{ backgroundColor: "#FEF3C7", color: "#F59E0B" }}>
                            <AlertTriangle className="h-3 w-3" />
                            Sur commande
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Features */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#FEFEFE", borderColor: "#D1B8B9" }}>
                      <Truck className="h-4 w-4" style={{ color: "#BE141E" }} />
                      <span className="text-xs font-medium" style={{ color: "#201A1A" }}>Livraison 24h</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#FEFEFE", borderColor: "#D1B8B9" }}>
                      <Shield className="h-4 w-4" style={{ color: "#BE141E" }} />
                      <span className="text-xs font-medium" style={{ color: "#201A1A" }}>Garantie 2 ans</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#FEFEFE", borderColor: "#D1B8B9" }}>
                      <Award className="h-4 w-4" style={{ color: "#BE141E" }} />
                      <span className="text-xs font-medium" style={{ color: "#201A1A" }}>Qualité OE</span>
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-lg border" style={{ backgroundColor: "#FEFEFE", borderColor: "#D1B8B9" }}>
                      <Zap className="h-4 w-4" style={{ color: "#BE141E" }} />
                      <span className="text-xs font-medium" style={{ color: "#201A1A" }}>Installation</span>
                    </div>
                  </div>
                  
                  {/* Quantity & Add to Cart */}
                  <div className="border-2 rounded-lg p-4 sm:p-6" style={{ borderColor: "#D1B8B9" }}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium" style={{ color: "#201A1A" }}>Quantité</label>
                        <div className="flex items-center gap-1 bg-white border rounded-lg p-1" style={{ borderColor: "#D1B8B9" }}>
                          <button
                            className="h-10 w-10 p-0 rounded hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: "#D1B8B9", color: "#201A1A" }}
                            onClick={() => handleQuantityChange(-1)}
                            disabled={quantity <= 1}
                          >
                            <Minus className="h-4 w-4 mx-auto" />
                          </button>
                          <span className="w-12 text-center font-medium" style={{ color: "#201A1A" }}>{quantity}</span>
                          <button
                            className="h-10 w-10 p-0 rounded hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: "#D1B8B9", color: "#201A1A" }}
                            onClick={() => handleQuantityChange(1)}
                          >
                            <Plus className="h-4 w-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      {(() => {
                        const isOutOfStock = stockStatus && !stockStatus.inStock
                        const isNotInCatalog = !stockStatus
                        
                        if (isOutOfStock || isNotInCatalog) {
                          return (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <button 
                                  onClick={handleCall}
                                  className="h-12 text-base font-semibold border rounded-md px-4 py-2 transition-all duration-200 hover:opacity-90"
                                  style={{ backgroundColor: "#BE141E", color: "white", borderColor: "#BE141E" }}
                                >
                                  <Phone className="h-4 w-4 inline mr-2" />
                                  Appeler
                                </button>
                                <button 
                                  onClick={handleWhatsApp}
                                  className="h-12 text-base font-semibold border rounded-md px-4 py-2 transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
                                  style={{ backgroundColor: "#25D366", color: "white", borderColor: "#25D366" }}
                                >
                                  <WhatsAppIcon className="h-4 w-4" />
                                  WhatsApp
                                </button>
                              </div>
                              <div className="text-center">
                                <p className="text-sm" style={{ color: "#B16C70" }}>
                                  Article sur commande - Contactez-nous pour vérifier la disponibilité
                                </p>
                              </div>
                            </div>
                          )
                        } else {
                          return (
                            <button 
                              onClick={handleAddToCart}
                              className="w-full h-12 text-base font-semibold rounded-md transition-all duration-200 hover:opacity-90 flex items-center justify-center gap-2"
                              style={{ backgroundColor: "#BE141E", color: "white" }}
                            >
                              <Package className="h-4 w-4" />
                              Ajouter au panier • {stockStatus?.price ? `${(stockStatus.price * quantity).toFixed(2)} TND` : "---"}
                            </button>
                          )
                        }
                      })()}

                      <div className="grid grid-cols-2 gap-3">
                        <button className="h-11 border rounded-md px-4 py-2 transition-all duration-200 hover:opacity-80" style={{ borderColor: "#D1B8B9", color: "#201A1A" }}>
                          <Heart className="h-4 w-4 inline mr-2" />
                          Favoris
                        </button>
                        <button className="h-11 border rounded-md px-4 py-2 transition-all duration-200 hover:opacity-80" style={{ borderColor: "#D1B8B9", color: "#201A1A" }}>
                          <Share2 className="h-4 w-4 inline mr-2" />
                          Partager
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Tabs */}
              <div className="mt-8 lg:mt-12">
                <div className="w-full">
                  <div className="grid w-full grid-cols-2 h-12 sm:h-auto border-b" style={{ borderColor: "#D1B8B9" }}>
                    {[
                      { id: 'equivalence', label: 'Équivalence' },
                      { id: 'compatibility', label: 'Compatibilité' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`text-xs sm:text-sm px-2 py-2 border-b-2 transition ${
                          activeTab === tab.id 
                            ? 'border-b-2' 
                            : 'border-transparent hover:opacity-80'
                        }`}
                        style={{
                          borderBottomColor: activeTab === tab.id ? '#BE141E' : 'transparent',
                          color: activeTab === tab.id ? '#BE141E' : '#201A1A'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>




                  {activeTab === 'equivalence' && (
                    <div className="mt-6 border rounded-lg p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="h-5 w-5" style={{ color: "#BE141E" }} />
                        <h3 className="text-lg font-semibold">Pièces équivalentes</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Articles de différents fournisseurs compatibles avec les mêmes références OEM
                      </p>
                      
                      {equivalenceLoading && streamingEquivalents.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm text-muted-foreground">Recherche des pièces équivalentes...</span>
                          </div>
                        </div>
                      ) : streamingEquivalents.length > 0 || streamingComplete ? (
                        <div className="space-y-4">
                          {streamingEquivalents.length > 0 && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg">Articles équivalents</h3>
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  {streamingEquivalents.length} trouvé{streamingEquivalents.length > 1 ? 's' : ''} {!streamingComplete && '...'}
                                </span>
                              </div>
                              
                              {/* Scrollable Listbox */}
                              <div className="border rounded-lg" style={{ borderColor: "#D1B8B9" }}>
                                <div className="max-h-96 overflow-y-auto">
                                  <div className="divide-y" style={{ borderColor: "#D1B8B9" }}>
                                {streamingEquivalents.map((equivalent) => (
                                     <div key={equivalent.articleId} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3 flex-1">
                                       {/* Supplier Logo */}
                                       <div className="flex-shrink-0">
                                         <SupplierLogo 
                                           supplierName={equivalent.supplierName}
                                           className="h-12 w-12"
                                         />
                                       </div>
                                       
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                               <span className="font-medium text-sm" style={{ color: "#201A1A" }}>{equivalent.supplierName}</span>
                                               <span className="text-xs border px-2 py-0.5 rounded" style={{ borderColor: "#D1B8B9", color: "#B16C70" }}>
                                            Réf: {equivalent.articleNo}
                                          </span>
                                        </div>
                                        {equivalent.eanNumbers && equivalent.eanNumbers.length > 0 && (
                                               <div className="text-xs" style={{ color: "#B16C70" }}>
                                            EAN: {equivalent.eanNumbers[0]}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {equivalent.media && equivalent.media.length > 0 && (
                                        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
                                          <img 
                                            src={equivalent.media[0].s3image || equivalent.media[0].imageMedia}
                                            alt={equivalent.supplierName}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <button
                                            className="h-8 px-3 border rounded text-xs hover:opacity-80 transition-opacity"
                                            style={{ backgroundColor: "#BE141E", color: "white", borderColor: "#BE141E" }}
                                        onClick={() => window.open(`/article/${equivalent.articleId}`, '_blank')}
                                      >
                                            <Link className="h-3 w-3 inline mr-1" /> Voir
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                  </div>
                                </div>
                              </div>

                              {equivalenceData?.note && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                  <p className="text-xs text-amber-800">
                                    <AlertTriangle className="h-4 w-4 inline mr-1" /> <strong>Note:</strong> {equivalenceData.note}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {streamingComplete && streamingEquivalents.length === 0 && (
                            <div className="text-center py-8">
                              <Package className="h-16 w-16 mx-auto mb-4" style={{ color: "#B16C70" }} />
                              <p className="text-muted-foreground mb-2">Aucune pièce équivalente trouvée</p>
                              <p className="text-xs text-muted-foreground">
                                Cette pièce n'a pas d'équivalents disponibles dans notre catalogue.
                              </p>
                            </div>
                          )}

                          <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              <Lightbulb className="h-4 w-4 inline mr-1" /> <strong>Info:</strong> Ces pièces sont des équivalents basés sur les références OEM. 
                              Elles sont conçues pour s'adapter aux mêmes véhicules que la pièce originale.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertTriangle className="h-16 w-16 mx-auto mb-4" style={{ color: "#B16C70" }} />
                          <p className="text-muted-foreground mb-2">Erreur lors du chargement</p>
                          <p className="text-xs text-muted-foreground">
                            Impossible de charger les pièces équivalentes pour le moment.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'compatibility' && (
                    <div className="mt-6 space-y-6">
                      {/* OEM Numbers Section */}
                      <div className="border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Check className="h-4 w-4" style={{ color: "#10B981" }} />
                          <h3 className="text-lg font-semibold">Références OE / OEM</h3>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Numéros de pièces d'origine constructeur compatibles
                        </p>
                        
                        {article.oemNo && article.oemNo.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                              <span className="text-sm font-medium">
                                {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE trouvée{article.oemNo.length > 1 ? 's' : ''}
                              </span>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                              {article.oemNo.map((oem: any, index: number) => (
                                <div key={index} className="border border-border/40 rounded-lg p-4 hover:bg-muted/20 transition-colors">
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Award className="h-4 w-4" style={{ color: "#BE141E" }} />
                                      </div>
                                      <div>
                                        <h4 className="font-semibold text-sm">{oem.oemBrand || oem.manufacturerName || 'Constructeur'}</h4>
                                        <p className="text-xs text-muted-foreground">Référence OE</p>
                                      </div>
                                    </div>
                                    <span className="text-xs bg-muted px-2 py-1 rounded">OE</span>
                                  </div>
                                  
                                  <div className="flex items-center justify-between bg-background/50 p-2 rounded-md border border-border/30">
                                    <code className="text-xs font-mono font-medium text-foreground">
                                      {oem.oemDisplayNo || oem.oemNumber}
                                    </code>
                                    <button
                                      className="h-6 w-6 p-0 hover:bg-primary/10 rounded"
                                      onClick={() => copyToClipboard(oem.oemDisplayNo || oem.oemNumber)}
                                      title="Copier la référence"
                                    >
                                      📋
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center gap-2 text-green-700">
                                <Check className="h-4 w-4" style={{ color: "#10B981" }} />
                                <span className="text-sm font-medium">
                                  {article.oemNo.length} référence{article.oemNo.length > 1 ? 's' : ''} OE compatible{article.oemNo.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                Cette pièce remplace directement les références d'origine constructeur
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Info className="h-8 w-8 mx-auto" style={{ color: "#BE141E" }} />
                            </div>
                            <h4 className="font-medium mb-2">Aucune référence OE disponible</h4>
                            <p className="text-sm text-muted-foreground">
                              Les informations de compatibilité OE ne sont pas disponibles pour cette pièce
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Vehicle Compatibility Info */}
                      <div className="border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Truck className="h-4 w-4" style={{ color: "#3B82F6" }} />
                          <h3 className="text-lg font-semibold">Informations de compatibilité</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4" style={{ color: "#BE141E" }} />
                                <span className="font-medium text-sm">Garantie de compatibilité</span>
                              </div>
                              <p className="text-xs text-blue-700">
                                Pièce garantie compatible selon les spécifications TecDoc
                              </p>
                            </div>
                            
                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4" style={{ color: "#F59E0B" }} />
                                <span className="font-medium text-sm">Vérification recommandée</span>
                              </div>
                              <p className="text-xs text-amber-700">
                                Vérifiez toujours la compatibilité avec votre véhicule avant commande
                              </p>
                            </div>
                          </div>
                          
                          <div className="p-4 border border-border/40 rounded-lg">
                            <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
                              <span><Link className="h-3 w-3" /></span>
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
                      </div>
                    </div>
                  )}

                        </div>
                      </div>
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
