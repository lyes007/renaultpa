"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Moon, 
  Sun, 
  Menu, 
  ShoppingCart, 
  Search, 
  X, 
  Home,
  Settings,
  User,
  Phone,
  Mail,
  MapPin,
  Zap,
  ChevronDown,
  Clock
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useCart } from "@/hooks/use-cart"
import { searchArticlesByNumber, searchArticlesByOEMNumber, postQuickArticleSearch, searchArticlesByNumberAndSupplierId } from "@/lib/apify-api"
import { useRouter } from "next/navigation"
import { useCountry } from "@/contexts/country-context"
import { CountrySelector } from "@/components/country-selector"
import { RobustProductImage } from "@/components/ui/robust-product-image"
import { SupplierLogo } from "@/components/ui/supplier-logo"

interface StockStatus {
  inStock: boolean
  stockLevel: number
  price: number
  priceHT: number
}

export function Header() {
  const { selectedCountry } = useCountry()
  const { theme, setTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [stockData, setStockData] = useState<Map<string, StockStatus>>(new Map())
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mobileSearchRef = useRef<HTMLInputElement>(null)
  const { toggleCart, getTotalItems } = useCart()
  const router = useRouter()

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search-history')
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory).slice(0, 5))
    }
    const savedRecent = localStorage.getItem('recent-searches')
    if (savedRecent) {
      setRecentSearches(JSON.parse(savedRecent).slice(0, 3))
    }
  }, [])

  // Save to search history
  const saveToHistory = (query: string) => {
    const trimmedQuery = query.trim()
    if (!trimmedQuery) return
    
    const newHistory = [trimmedQuery, ...searchHistory.filter(h => h !== trimmedQuery)].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem('search-history', JSON.stringify(newHistory))
    
    const newRecent = [trimmedQuery, ...recentSearches.filter(r => r !== trimmedQuery)].slice(0, 3)
    setRecentSearches(newRecent)
    localStorage.setItem('recent-searches', JSON.stringify(newRecent))
  }

  // Enhanced search with multiple endpoints
  const handleSearch = async (query?: string) => {
    const searchTerm = query || searchQuery.trim()
    if (!searchTerm) return
    
    setIsSearching(true)
    setShowSearchResults(true)
    saveToHistory(searchTerm)
    
    try {
      console.log("[ENHANCED-SEARCH] Starting multi-endpoint search for:", searchTerm)
      
      // Run multiple search endpoints in parallel for better results
      const searchPromises = [
        searchArticlesByNumber(searchTerm, selectedCountry.id),
        searchArticlesByOEMNumber(searchTerm, selectedCountry.id),
        postQuickArticleSearch(searchTerm, selectedCountry.id)
      ]
      
      const responses = await Promise.allSettled(searchPromises)
      console.log("[ENHANCED-SEARCH] All search responses:", responses)
      
      let allArticles: any[] = []
      
      // Process each response and collect articles
      responses.forEach((response, index) => {
        const searchType = ['article-number', 'oem-number', 'quick-search'][index]
        
        if (response.status === 'fulfilled' && !response.value.error) {
          console.log(`[ENHANCED-SEARCH] ${searchType} search successful`)
          
        let searchData: any = null
          if (Array.isArray(response.value.data) && response.value.data.length > 0) {
            searchData = response.value.data[0]
          } else if (response.value.data && typeof response.value.data === 'object') {
            searchData = response.value.data
          }
          
          if (searchData?.articles && Array.isArray(searchData.articles)) {
            console.log(`[ENHANCED-SEARCH] Found ${searchData.articles.length} articles from ${searchType}`)
            allArticles.push(...searchData.articles)
          }
        } else {
          console.log(`[ENHANCED-SEARCH] ${searchType} search failed or returned no results`)
        }
      })
      
      // Remove duplicates based on articleId
      const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.articleId === article.articleId)
      )
      
      console.log(`[ENHANCED-SEARCH] Total unique articles found: ${uniqueArticles.length}`)
      
      if (uniqueArticles.length > 0) {
        // Sort by relevance (articles from article-number search first, then others)
        const sortedArticles = uniqueArticles.sort((a, b) => {
          // Prioritize exact matches in article number
          const aExactMatch = a.articleNo?.toLowerCase().includes(searchTerm.toLowerCase())
          const bExactMatch = b.articleNo?.toLowerCase().includes(searchTerm.toLowerCase())
          
          if (aExactMatch && !bExactMatch) return -1
          if (!aExactMatch && bExactMatch) return 1
          return 0
        })
        
        setSearchResults(sortedArticles)
          // Load stock data for search results
        loadStockDataForResults(sortedArticles)
        } else {
        console.log("[ENHANCED-SEARCH] No articles found from any endpoint")
          setSearchResults([])
      }
    } catch (error) {
      console.error("[ENHANCED-SEARCH] Search failed:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const loadStockDataForResults = async (articles: any[]) => {
    try {
      const articleCodes = articles.map(article => article.articleNo)
      
      const response = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleCodes })
      })

      if (response.ok) {
        const data = await response.json()
        const stockMap = new Map<string, StockStatus>()
        
        Object.entries(data.stockStatuses || {}).forEach(([code, status]) => {
          if (status) {
            stockMap.set(code, status as StockStatus)
          }
        })
        
        setStockData(stockMap)
        
        // Filter search results to only show articles that exist in CSV
        const filteredResults = articles.filter(article => stockMap.has(article.articleNo))
        setSearchResults(filteredResults)
      }
    } catch (error) {
      console.error('Error loading stock data for search results:', error)
    }
  }

  // Enhanced keyboard handling
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowSearchResults(false)
      setSearchFocused(false)
      searchInputRef.current?.blur()
    } else if (e.key === "/" && e.metaKey) {
      e.preventDefault()
      searchInputRef.current?.focus()
    }
  }

  // Handle input focus and blur
  const handleSearchFocus = () => {
    setSearchFocused(true)
    if (searchQuery.trim() || recentSearches.length > 0) {
      setShowSearchResults(true)
    }
  }

  const handleSearchBlur = () => {
    // Delay to allow click events on results
    setTimeout(() => {
      setSearchFocused(false)
    }, 150)
  }

  // Clear search
  const clearSearch = () => {
    setSearchQuery("")
    setShowSearchResults(false)
    setSearchResults([])
    searchInputRef.current?.focus()
  }

  // Handle recent search selection
  const handleRecentSearch = (query: string) => {
    setSearchQuery(query)
    handleSearch(query)
  }


  // Handle mobile search
  const handleMobileSearch = async () => {
    if (!searchQuery.trim()) return
    await handleSearch()
  }

     const handleArticleSelect = (articleId: number) => {
     setShowSearchResults(false)
     setSearchQuery("")
     router.push(`/article/${articleId}`)
   }

  const handleViewAllResults = () => {
    setShowSearchResults(false)
    setSearchQuery("")
    router.push(`/?search=${encodeURIComponent(searchQuery)}`)
  }

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="border-b bg-background shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        {/* Top bar for contact info - desktop only */}
        <div className="hidden lg:flex items-center justify-between py-2 text-xs text-muted-foreground border-b border-border/30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>+216 XX XXX XXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>contact@spar-auto.tn</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>Tunis, Tunisie</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Livraison 24h
            </Badge>
            <Badge variant="outline" className="text-xs">
              Garantie 2 ans
            </Badge>
          </div>
        </div>

        {/* Main navigation */}
        <div className="flex items-center justify-between py-3 lg:py-4">
          {/* Mobile Menu Button - Left side on mobile */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className={`h-5 w-5 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`} />
              <span className="sr-only">Menu</span>
            </Button>
          </div>

          {/* Logo and brand - Centered on mobile, left on desktop */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group lg:flex-1"
            onClick={() => router.push('/')}
          >
            <div className="flex items-center gap-1">
              {/* Renault Pieces Auto Logo - Small for mobile, large for desktop */}
              <img
                src="/LOGO Piece renault small.png"
                alt="Pièces Auto Renault"
                className="h-10 w-auto sm:hidden transition-all duration-300 group-hover:scale-105"
                />
                <img
                src="/LOGO Piece renault.png"
                alt="Pièces Auto Renault"
                className="hidden sm:block h-16 w-auto lg:h-20 transition-all duration-300 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="relative flex-1 max-w-xl mx-4 lg:mx-8 hidden sm:block" ref={searchRef}>
            <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-[1.02]' : ''}`}>
              {/* Search Icon */}
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                {isSearching ? (
                  <div className="h-5 w-5 animate-spin border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <Search className={`h-5 w-5 transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>

              {/* Enhanced Search Input */}
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Rechercher par référence, marque ou pièce... (Cmd+/)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={`w-full pl-12 pr-24 py-3 lg:py-4 border-2 rounded-xl text-sm lg:text-base 
                         transition-all duration-300 placeholder:text-muted-foreground/70
                         ${searchFocused 
                           ? 'border-primary bg-background shadow-lg shadow-primary/10 ring-4 ring-primary/10' 
                           : 'border-border bg-background/50 hover:border-primary/50 hover:bg-background/80'
                         }`}
              />

              {/* Action Buttons */}
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearSearch}
                    className="h-8 w-8 hover:bg-muted/80 rounded-lg transition-all duration-200"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {/* Desktop search button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSearch()}
                  className="h-8 w-8 hover:bg-primary/10 rounded-lg transition-all duration-200"
                  disabled={!searchQuery.trim()}
                >
                  <Search className="h-4 w-4 text-primary" />
                </Button>
              </div>

              {/* Keyboard shortcut hint */}
              {!searchFocused && !searchQuery && (
                <div className="hidden lg:flex absolute right-4 top-1/2 transform -translate-y-1/2 items-center gap-1 text-xs text-muted-foreground/50">
                  <kbd className="px-2 py-1 bg-muted/30 rounded text-[10px] border border-border/30">⌘</kbd>
                  <kbd className="px-2 py-1 bg-muted/30 rounded text-[10px] border border-border/30">/</kbd>
                </div>
              )}
            </div>

            {/* Advanced Search Results Dropdown */}
            {showSearchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border-2 border-border/20 rounded-xl shadow-xl max-h-96 overflow-y-auto z-50">
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-foreground">
                        {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''} trouvé{searchResults.length > 1 ? 's' : ''}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleViewAllResults}
                        className="text-xs h-7 px-3 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      >
                        Voir tous
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {searchResults.slice(0, 5).map((article, index) => (
                        <div
                          key={article.articleId}
                          onClick={() => handleArticleSelect(article.articleId)}
                          className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 cursor-pointer transition-all duration-200 border border-transparent hover:border-primary/20 group search-result-item"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg flex-shrink-0 overflow-hidden">
                            <RobustProductImage
                              s3ImageLink={article.s3image && article.s3image.includes('fsn1.your-objectstorage.com') ? article.s3image : undefined}
                              imageLink={undefined}
                              imageMedia={undefined}
                              alt={article.articleProductName}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                              showDebug={false}
                              fallbackContent={
                                <div className="w-full h-full flex items-center justify-center">
                                  <Search className="h-5 w-5 text-muted-foreground" />
                                </div>
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary transition-colors">
                              {article.articleProductName}
                            </p>
                            <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                                Réf: {article.articleNo}
                              </p>
                              <SupplierLogo 
                                supplierName={article.supplierName}
                                size="sm"
                                showText={false}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              {(() => {
                                const stockStatus = stockData.get(article.articleNo)
                                const price = stockStatus?.price || 29.99
                                return `${price.toFixed(2)} TND`
                              })()}
                            </div>
                            {(() => {
                              const stockStatus = stockData.get(article.articleNo)
                              if (stockStatus) {
                                return stockStatus.inStock ? (
                                  <Badge variant="secondary" className="text-xs mt-1 bg-green-100 text-green-800">
                                    En stock
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    Rupture
                                  </Badge>
                                )
                              } else {
                                // This should never show since we filter out articles not in CSV
                                return null
                              }
                            })()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Searches - Show when no results or just focused */}
                {((searchResults.length === 0 && !isSearching) || (searchFocused && !searchQuery)) && recentSearches.length > 0 && (
                  <div className="p-4 border-t border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Recherches récentes
                    </h4>
                    <div className="space-y-1">
                      {recentSearches.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleRecentSearch(query)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground flex items-center gap-3 recent-search-item"
                        >
                          <Clock className="h-3 w-3 text-primary" />
                          {query}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {searchFocused && !searchQuery && (
                  <div className="p-4 border-t border-border/30">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Actions rapides</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Home className="h-4 w-4 text-primary" />
                        Parcourir
                      </button>
                      <button
                        onClick={() => router.push('/admin')}
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Settings className="h-4 w-4 text-primary" />
                        Admin
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-md border-2 border-border/20 rounded-xl shadow-xl p-6 text-center z-50">
                <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-2">Aucun résultat trouvé</p>
                <p className="text-xs text-muted-foreground mb-4">Essayez avec d'autres mots-clés</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewAllResults}
                  className="rounded-lg hover:bg-primary hover:text-primary-foreground"
                >
                  Parcourir tous les articles
                </Button>
              </div>
            )}
          </div>

          {/* Modern Action Buttons */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="h-10 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                <Home className="h-4 w-4 mr-2" />
                Accueil
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin')}
                className="h-10 px-4 rounded-lg hover:bg-primary/10 transition-all duration-200"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            </div>

            {/* Cart Button with Enhanced Design */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCart}
              className="relative h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center text-xs font-bold bg-primary text-primary-foreground border-2 border-background animate-pulse"
                >
                  {getTotalItems()}
                </Badge>
              )}
              <span className="sr-only">Panier ({getTotalItems()} articles)</span>
            </Button>

            {/* Theme Toggle with Enhanced Design */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-11 w-11 rounded-xl hover:bg-primary/10 transition-all duration-200 hover:scale-105"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Basculer le thème</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden overflow-hidden mobile-menu-slide">
            <div className="bg-gradient-to-b from-background to-muted/20 border-t border-border/30 mx-4 rounded-b-xl">
              <div className="p-6 space-y-6">
                {/* Brand info */}
                                 <div className="text-center space-y-2">
                   <p className="text-sm text-muted-foreground">
                     Spécialiste pièces détachées
                   </p>
                  <div className="flex justify-center gap-4 mt-4">
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Livraison 24h
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Garantie 2 ans
                    </Badge>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <Home className="h-5 w-5 mr-3" />
                    <span className="text-base">Accueil</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={() => {
                      router.push('/admin')
                      setMobileMenuOpen(false)
                    }}
                    className="w-full justify-start h-12 rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    <span className="text-base">Administration</span>
                  </Button>
                </div>

                {/* Country Selector */}
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <h3 className="text-sm font-semibold text-foreground">Region Settings</h3>
                  <CountrySelector 
                    variant="outline" 
                    size="default"
                    className="w-full h-12 rounded-xl justify-start"
                  />
                  <p className="text-xs text-muted-foreground">
                    Select your country to filter compatible parts and regional availability.
                  </p>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border/30">
                  <h3 className="text-sm font-semibold text-foreground">Contact</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>+216 XX XXX XXX</span>
                    </div>
                                         <div className="flex items-center gap-3">
                       <Mail className="h-4 w-4 text-primary" />
                       <span>contact@spar-auto.tn</span>
                     </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>Tunis, Tunisie</span>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <Button
                  variant="outline"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full h-12 rounded-xl border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <X className="h-5 w-5 mr-2" />
                  Fermer le menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Bar - Always visible under navbar */}
      <div className="sm:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm">
        <div className="px-4 py-3">
          <div className="relative">
            {/* Search Icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
              {isSearching ? (
                <div className="h-4 w-4 animate-spin border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Mobile Search Input */}
              <input
                ref={mobileSearchRef}
                type="text"
              placeholder="Rechercher par référence, marque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleMobileSearch()
                  }
                }}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border/40 rounded-lg text-base 
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50
                       placeholder:text-muted-foreground/70 mobile-search-input"
              />
            
            {/* Clear Button */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
                       onClick={() => {
                    setSearchQuery("")
                    setShowSearchResults(false)
                    setSearchResults([])
                  }}
                  className="h-8 w-8 hover:bg-muted/80 rounded-lg"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
                 </div>
               </div>

          {/* Mobile Search Results */}
          {showSearchResults && (
            <div className="mt-3 bg-background/95 backdrop-blur-md border border-border/20 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {searchResults.length} résultat{searchResults.length > 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleViewAllResults}
                      className="text-xs h-6 px-2 rounded"
                    >
                      Voir tous
                    </Button>
                  </div>
                <div className="space-y-2">
                    {searchResults.slice(0, 5).map((article, index) => (
                    <div
                      key={article.articleId}
                        onClick={() => handleArticleSelect(article.articleId)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 bg-muted/30 rounded-lg flex-shrink-0 overflow-hidden">
                        <RobustProductImage
                          s3ImageLink={article.s3image && article.s3image.includes('fsn1.your-objectstorage.com') ? article.s3image : undefined}
                          imageLink={undefined}
                          imageMedia={undefined}
                          alt={article.articleProductName}
                          className="w-full h-full object-cover"
                          showDebug={false}
                          fallbackContent={
                            <div className="w-full h-full flex items-center justify-center">
                                <Search className="h-4 w-4 text-muted-foreground" />
                            </div>
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{article.articleProductName}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground truncate">
                              Réf: {article.articleNo}
                            </p>
                            <SupplierLogo 
                              supplierName={article.supplierName}
                              size="sm"
                              showText={false}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs font-semibold text-primary">
                            {(() => {
                              const stockStatus = stockData.get(article.articleNo)
                              const price = stockStatus?.price || 29.99
                              return `${price.toFixed(2)} TND`
                            })()}
                          </p>
                          {(() => {
                            const stockStatus = stockData.get(article.articleNo)
                            if (stockStatus) {
                              return stockStatus.inStock ? (
                                  <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-green-100 text-green-800">
                                    Stock
                                </Badge>
                              ) : (
                                  <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                  Rupture
                                </Badge>
                              )
                            } else {
                              return null
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </div>
              )}

              {/* Recent Searches - Show when no results or just focused */}
              {((searchResults.length === 0 && !isSearching) || (searchFocused && !searchQuery)) && recentSearches.length > 0 && (
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                    Récentes
                  </h4>
                  <div className="space-y-1">
                    {recentSearches.map((query, index) => (
                  <button
                        key={index}
                        onClick={() => handleRecentSearch(query)}
                        className="w-full text-left px-2 py-1 rounded text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
                      >
                        <Clock className="h-3 w-3 text-primary" />
                        {query}
                  </button>
                    ))}
                  </div>
              </div>
            )}

            {/* No results */}
            {showSearchResults && searchResults.length === 0 && searchQuery && !isSearching && (
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                  <p className="text-sm font-medium mb-1">Aucun résultat</p>
                  <p className="text-xs text-muted-foreground">
                    Essayez d'autres mots-clés
                </p>
              </div>
            )}
        </div>
      )}
        </div>
      </div>
    </header>
  )
}
