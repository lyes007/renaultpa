"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartDrawer } from "@/components/cart-drawer"
import { useVehicle } from "@/contexts/vehicle-context"
import { useCountry } from "@/contexts/country-context"
import { getCategories } from "@/lib/apify-api"
import {
  Home,
  ChevronRight,
  ArrowLeft,
  Car,
  Settings,
  Fuel,
  Zap,
  Wrench,
  Shield,
  Wind,
  Thermometer,
  Disc,
  Cog,
  Battery,
  Lightbulb,
  Filter,
  Gauge,
  Truck,
  CircleDot,
  Package,
  HardHat,
  Briefcase,
  Lock,
  Camera,
  Sparkles,
  X,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import "./categories.css"

// Local mappings for category images (kept identical to existing usage)
const getCategoryImage = (categoryName: string): string | null => {
  const normalizedName = categoryName.trim()
  const imageMap: Record<string, string> = {
    Accessoires: "/categories/Accessoires.jpeg",
    "Alimentation carburant": "/categories/Alimentation carburant.jpg",
    "Allumage / préchauffage": "/categories/Allumage  préchauffage.jpeg",
    "Allumage préchauffage": "/categories/Allumage  préchauffage.jpeg",
    "Boîte de vitesses": "/categories/Boîte de vitesses.jpeg",
    Carburation: "/categories/Carburation.jpeg",
    Carrosserie: "/categories/Carrosserie.jpeg",
    "Chauffage / Ventilation": "/categories/Chauffage  Ventilation.jpeg",
    "Chauffage Ventilation": "/categories/Chauffage  Ventilation.jpeg",
    Climatisation: "/categories/Climatisation.jpeg",
    "Commande à courroie": "/categories/Commande à courroie.jpeg",
    Direction: "/categories/Direction.jpeg",
    "Dispositif d'attelage accessoires": "/categories/Dispositif d'attelage accessoires.jpeg",
    "Dispositif dattelage accessoires": "/categories/Dispositif d'attelage accessoires.jpeg",
    "Dispositif de freinage": "/categories/Dispositif de freinage.jpeg",
    Échappement: "/categories/Échappement.jpeg",
    "Embrayage / composants": "/categories/Embrayage  composants.jpeg",
    "Embrayage composants": "/categories/Embrayage  composants.jpeg",
    "Entraînement des essieux": "/categories/Entraînement des essieux.jpeg",
    "Entraînement des roues": "/categories/Entraînement des roues.jpeg",
    "Entraînement hybride électrique": "/categories/Entraînement hybride électrique.jpeg",
    "Équipement intérieur": "/categories/Équipement intérieur.jpeg",
    Filtre: "/categories/Filtre.jpeg",
    Moteur: "/categories/Moteur.jpeg",
    "Nettoyage des phares": "/categories/Nettoyage des phares.jpeg",
    "Nettoyage des vitres": "/categories/Nettoyage des vitres.jpeg",
    "Outils spéciaux": "/categories/Outils spéciaux.jpeg",
    "Pièces de maintenance": "/categories/Pièces de maintenance.jpeg",
    "Portes-bagages": "/categories/Portes-bagages.jpeg",
    "Prise de force": "/categories/Prise de force.jpeg",
    Refroidissement: "/categories/Refroidissement.jpeg",
    "Roues / Pneus": "/categories/Roues Pneus.jpeg",
    "Roues Pneus": "/categories/Roues Pneus.jpeg",
    "Suspension / Amortissement": "/categories/Suspension Amortissement.jpeg",
    "Suspension Amortissement": "/categories/Suspension Amortissement.jpeg",
    "Suspension d'essieu / Guidage des roues / Roues": "/categories/Suspension d'essieu Guidage des roues Roues.jpeg",
    "Suspension dessieu Guidage des roues Roues": "/categories/Suspension d'essieu Guidage des roues Roues.jpeg",
    "Système d'information et de communication": "/categories/Système d'information et de communication.jpeg",
    "Système dinformation et de communication": "/categories/Système d'information et de communication.jpeg",
    "Système électrique": "/categories/Système électrique.jpeg",
    "Système pneumatique": "/categories/Système pneumatique.jpeg",
    "Systèmes de confort": "/categories/Systèmes de confort.jpeg",
    "Systèmes de sécurité": "/categories/Systèmes de sécurité.jpeg",
    Verrouillage: "/categories/Verrouillage.jpeg",
  }

  if (imageMap[normalizedName]) return imageMap[normalizedName]

  const normalizedForFile = normalizedName.replace(/\//g, " ").replace(/'/g, "").replace(/\s+/g, " ").trim()

  if (imageMap[normalizedForFile]) return imageMap[normalizedForFile]

  const fuzzyMatches: Record<string, string> = {
    accessoire: "Accessoires",
    moteur: "Moteur",
    filtre: "Filtre",
    frein: "Dispositif de freinage",
    direction: "Direction",
    climatisation: "Climatisation",
    carrosserie: "Carrosserie",
    suspension: "Suspension Amortissement",
    embrayage: "Embrayage composants",
    échappement: "Échappement",
    allumage: "Allumage préchauffage",
    chauffage: "Chauffage Ventilation",
    roues: "Roues Pneus",
    pneus: "Roues Pneus",
  }

  const lowerName = normalizedName.toLowerCase()
  for (const [key, category] of Object.entries(fuzzyMatches)) {
    if (lowerName.includes(key) && imageMap[category]) return imageMap[category]
  }
  return null
}

// Get appropriate icon for category
const getCategoryIcon = (categoryName: string) => {
  const normalizedName = categoryName.toLowerCase().trim()

  // Icon mapping based on category content
  if (normalizedName.includes("moteur")) return Car
  if (normalizedName.includes("filtre")) return Filter
  if (normalizedName.includes("frein") || normalizedName.includes("freinage")) return Disc
  if (normalizedName.includes("direction")) return Settings
  if (
    normalizedName.includes("climatisation") ||
    normalizedName.includes("chauffage") ||
    normalizedName.includes("ventilation")
  )
    return Wind
  if (normalizedName.includes("refroidissement")) return Thermometer
  if (normalizedName.includes("carrosserie")) return Shield
  if (normalizedName.includes("suspension") || normalizedName.includes("amortissement")) return Cog
  if (normalizedName.includes("embrayage")) return Settings
  if (normalizedName.includes("échappement")) return Gauge
  if (normalizedName.includes("allumage") || normalizedName.includes("préchauffage")) return Zap
  if (normalizedName.includes("roues") || normalizedName.includes("pneus")) return CircleDot
  if (normalizedName.includes("électrique") || normalizedName.includes("batterie")) return Battery
  if (normalizedName.includes("éclairage") || normalizedName.includes("phares")) return Lightbulb
  if (normalizedName.includes("carburant") || normalizedName.includes("alimentation")) return Fuel
  if (normalizedName.includes("accessoire")) return Package
  if (normalizedName.includes("outils")) return HardHat
  if (normalizedName.includes("verrouillage") || normalizedName.includes("sécurité")) return Lock
  if (normalizedName.includes("nettoyage") || normalizedName.includes("vitres")) return Sparkles
  if (normalizedName.includes("information") || normalizedName.includes("communication")) return Camera
  if (normalizedName.includes("confort")) return Briefcase
  if (normalizedName.includes("maintenance")) return Wrench
  if (normalizedName.includes("pneumatique")) return Gauge
  if (normalizedName.includes("attelage") || normalizedName.includes("bagages")) return Truck

  // Default icon
  return Package
}

// Types aligned with existing category structure
interface Category {
  level: number
  levelText_1: string | null
  levelId_1: string | null
  levelText_2: string | null
  levelId_2: string | null
  levelText_3: string | null
  levelId_3: string | null
  levelText_4: string | null
  levelId_4: string | null
}

interface TreeNode {
  id: string
  text: string
  level: number
  children: TreeNode[]
  categoryCount: number
  isSelectable: boolean
  originalCategory?: Category
}

export default function CategoriesPage() {
  const router = useRouter()
  const { selectedCountry } = useCountry()
  const { vehicleInfo, setCategoryInfo } = useVehicle()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPath, setCurrentPath] = useState<TreeNode[]>([])
  const [currentLevel, setCurrentLevel] = useState<TreeNode[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Category[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [quickFilters, setQuickFilters] = useState<string[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([])
  const [showQuickAccess, setShowQuickAccess] = useState(true)
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!vehicleInfo) {
      router.push("/")
      return
    }
  }, [vehicleInfo, router])

  // Load categories (preserving Apify API input)
  useEffect(() => {
    const load = async () => {
      if (!vehicleInfo) return
      setLoading(true)
      setError(null)
      try {
        const manufacturerId =
          vehicleInfo.selectionMethod === "manual" ? vehicleInfo.manufacturerId || 0 : vehicleInfo.manuId || 0
        const vehicleId = vehicleInfo.selectionMethod === "manual" ? vehicleInfo.vehicleId || 0 : vehicleInfo.carId || 0

        let categoriesData: Category[] = []
        const versions: Array<"v1" | "v2" | "v3"> = ["v1", "v2", "v3"]
        for (const version of versions) {
          const response = await getCategories(manufacturerId, vehicleId, selectedCountry.id, version)
          if (!response.error && (response.data as any)?.[0]?.categories) {
            if (version === "v1") {
              categoriesData = (response.data as any)[0].categories
            } else if (version === "v2") {
              categoriesData = convertV2ToV1Format((response.data as any)[0].categories)
            } else if (version === "v3") {
              categoriesData = convertV3ToV1Format((response.data as any)[0].categories)
            }
            if (categoriesData.length > 0) break
          }
        }

        if (categoriesData.length === 0) {
          setError("Aucune catégorie trouvée pour ce véhicule")
          setCategories([])
          return
        }

        setCategories(categoriesData)
        const roots = buildCategoryTree(categoriesData)
        setCurrentPath([])
        setCurrentLevel(roots)
      } catch (e) {
        console.error("Error loading categories:", e)
        setError("Erreur lors du chargement des catégories")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [vehicleInfo, selectedCountry.id])

  // Search
  useEffect(() => {
    if (!searchTerm.trim() && quickFilters.length === 0) {
      setIsSearching(false)
      setSearchResults([])
      return
    }
    setIsSearching(true)
    const filtered = categories.filter((cat) => {
      const categoryText = [cat.levelText_1, cat.levelText_2, cat.levelText_3, cat.levelText_4]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesSearch = !searchTerm.trim() || categoryText.includes(searchTerm.toLowerCase())
      const matchesFilter =
        quickFilters.length === 0 || quickFilters.some((filter) => categoryText.includes(filter.toLowerCase()))

      return matchesSearch && matchesFilter
    })
    setSearchResults(filtered)
  }, [searchTerm, categories, quickFilters])

  const convertV2ToV1Format = (v2Categories: any): Category[] => {
    const out: Category[] = []
    const process = (data: any, parentText: string | null = null, parentId: string | null = null, level = 1) => {
      const categoryName = data.categoryName
      const categoryId = data.categoryId?.toString()
      if (data.children && typeof data.children === "object") {
        Object.entries(data.children).forEach(([childName, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            process(childData, categoryName, categoryId, level + 1)
          } else {
            out.push({
              level: level + 1,
              levelText_1: level === 1 ? categoryName : parentText,
              levelId_1: level === 1 ? categoryId : parentId,
              levelText_2: level === 1 ? childName : categoryName,
              levelId_2: level === 1 ? childData.categoryId?.toString() || null : categoryId,
              levelText_3: level > 1 ? childName : null,
              levelId_3: level > 1 ? childData.categoryId?.toString() || null : null,
              levelText_4: null,
              levelId_4: null,
            })
          }
        })
      } else {
        out.push({
          level,
          levelText_1: level === 1 ? categoryName : parentText,
          levelId_1: level === 1 ? categoryId : parentId,
          levelText_2: level > 1 ? categoryName : null,
          levelId_2: level > 1 ? categoryId : null,
          levelText_3: null,
          levelId_3: null,
          levelText_4: null,
          levelId_4: null,
        })
      }
    }
    Object.entries(v2Categories).forEach(([, data]: [string, any]) => process(data))
    return out
  }

  const convertV3ToV1Format = (v3Categories: any): Category[] => {
    const out: Category[] = []
    const process = (data: any, parentText: string | null = null, parentId: string | null = null, level = 1) => {
      const categoryText = data.text
      const categoryId =
        Object.keys(v3Categories).find((key) => v3Categories[key] === data) ||
        Object.keys(data).find((key) => key !== "text" && key !== "children") ||
        null
      if (data.children && typeof data.children === "object") {
        Object.entries(data.children).forEach(([childId, childData]: [string, any]) => {
          if (childData.children && Object.keys(childData.children).length > 0) {
            process(childData, categoryText, categoryId, level + 1)
          } else {
            out.push({
              level: level + 1,
              levelText_1: level === 1 ? categoryText : parentText,
              levelId_1: level === 1 ? categoryId : parentId,
              levelText_2: level === 1 ? childData.text : categoryText,
              levelId_2: level === 1 ? childId : categoryId,
              levelText_3: level > 1 ? childData.text : null,
              levelId_3: level > 1 ? childId : null,
              levelText_4: null,
              levelId_4: null,
            })
          }
        })
      } else {
        out.push({
          level,
          levelText_1: level === 1 ? categoryText : parentText,
          levelId_1: level === 1 ? categoryId : parentId,
          levelText_2: level > 1 ? categoryText : null,
          levelId_2: level > 1 ? categoryId : null,
          levelText_3: null,
          levelId_3: null,
          levelText_4: null,
          levelId_4: null,
        })
      }
    }
    Object.entries(v3Categories).forEach(([, data]: [string, any]) => process(data))
    return out
  }

  const buildCategoryTree = (cats: Category[]): TreeNode[] => {
    const all: { [id: string]: TreeNode } = {}
    cats.forEach((category) => {
      const levels = [
        { text: category.levelText_1, id: category.levelId_1 },
        { text: category.levelText_2, id: category.levelId_2 },
        { text: category.levelText_3, id: category.levelId_3 },
        { text: category.levelText_4, id: category.levelId_4 },
      ].filter((level) => level.text && level.id)
      levels.forEach((lvl, index) => {
        const isLast = index === levels.length - 1
        const nodeId = lvl.id as string
        if (!all[nodeId]) {
          all[nodeId] = {
            id: nodeId,
            text: lvl.text as string,
            level: index + 1,
            children: [],
            categoryCount: 0,
            isSelectable: false,
            originalCategory: undefined,
          }
        }
        if (isLast) {
          all[nodeId].isSelectable = true
          all[nodeId].originalCategory = category
        }
        all[nodeId].categoryCount++
      })
    })
    cats.forEach((category) => {
      const levels = [
        { text: category.levelText_1, id: category.levelId_1 },
        { text: category.levelText_2, id: category.levelId_2 },
        { text: category.levelText_3, id: category.levelId_3 },
        { text: category.levelText_4, id: category.levelId_4 },
      ].filter((level) => level.text && level.id)
      for (let i = 0; i < levels.length - 1; i++) {
        const parentId = levels[i].id as string
        const childId = levels[i + 1].id as string
        const parent = all[parentId]
        const child = all[childId]
        if (parent && child && !parent.children.find((c) => c.id === childId)) {
          parent.children.push(child)
        }
      }
    })
    const roots = Object.values(all).filter((n) => n.level === 1)
    const sortNodes = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => a.text.localeCompare(b.text))
      nodes.forEach((n) => n.children.length && sortNodes(n.children))
    }
    sortNodes(roots)
    return roots
  }

  const handleBackToHome = () => router.push("/")
  const navigateToRoot = () => {
    setCurrentPath([])
    setCurrentLevel(buildCategoryTree(categories))
  }
  const navigateBack = () => {
    if (currentPath.length === 0) return
    const newPath = currentPath.slice(0, -1)
    setCurrentPath(newPath)
    setCurrentLevel(newPath.length ? newPath[newPath.length - 1].children : buildCategoryTree(categories))
  }

  const navigateToCategory = (node: TreeNode) => {
    if (node.children.length > 0) {
      setCurrentPath([...currentPath, node])
      setCurrentLevel(node.children)
      return
    }
    if (node.isSelectable && node.originalCategory) {
      const id = node.id
      const name = node.text
      setCategoryInfo({ categoryId: id, categoryName: name })
      router.push("/products")
    }
  }

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleViewAllSubcategories = (node: TreeNode) => {
    if (node.children.length > 0) {
      setCurrentPath([...currentPath, node])
      setCurrentLevel(node.children)
    }
  }

  const handleSearchResultClick = (category: Category) => {
    const id = category.levelId_4 || category.levelId_3 || category.levelId_2 || category.levelId_1
    const text =
      category.levelText_4 || category.levelText_3 || category.levelText_2 || category.levelText_1 || "Catégorie"
    if (id) {
      setCategoryInfo({ categoryId: id, categoryName: text })
      router.push("/products")
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setIsSearching(false)
    setSearchResults([])
  }

  const popularCategories = [
    "Moteur",
    "Filtre",
    "Dispositif de freinage",
    "Direction",
    "Suspension Amortissement",
    "Roues Pneus",
    "Système électrique",
    "Échappement",
  ]

  const toggleQuickFilter = (category: string) => {
    setQuickFilters((prev) => (prev.includes(category) ? prev.filter((f) => f !== category) : [...prev, category]))
  }

  if (!vehicleInfo) {
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
                <Car className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#201A1A" }}>
                Aucun véhicule sélectionné
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#B16C70" }}>
                Veuillez sélectionner un véhicule pour accéder aux catégories de pièces détachées
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

  const vehicleTitle =
    vehicleInfo.selectionMethod === "manual"
      ? `${vehicleInfo.manufacturerName} ${vehicleInfo.modelName}`
      : vehicleInfo.carName || ""
  const vehicleSubtitle =
    vehicleInfo.selectionMethod === "manual" ? vehicleInfo.typeEngineName : vehicleInfo.vehicleTypeDescription || ""
  const vehicleId = vehicleInfo.selectionMethod === "manual" ? vehicleInfo.vehicleId : vehicleInfo.carId

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FEFEFE" }}>
      <Header />

      <div className="bg-white border-b shadow-sm" style={{ borderColor: "#D1B8B9" }}>
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-3" style={{ color: "#B16C70" }}>
            <button
              onClick={handleBackToHome}
              className="flex items-center gap-1 hover:opacity-80 transition-opacity"
              style={{ color: "#BE141E" }}
            >
              <Home className="h-4 w-4" />
              <span>Accueil</span>
            </button>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium" style={{ color: "#201A1A" }}>
              Catégories
            </span>
          </nav>

          {/* Vehicle Info Card - Made much smaller */}
          <div className="rounded-xl p-4 text-white mb-4" style={{ backgroundColor: "#BE141E" }}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-lg font-bold mb-1">{vehicleTitle}</h1>
                <div className="flex items-center gap-3 text-sm opacity-90">
                  <span>{vehicleSubtitle}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">ID: {vehicleId}</span>
                </div>
              </div>
              <button
                onClick={handleBackToHome}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
              >
                <Settings className="h-3 w-3" />
                <span>Changer</span>
              </button>
            </div>
          </div>

          {/* Enhanced Search Bar with new design */}
          <div className="max-w-md mx-auto mb-6">
            <div className="search-container">
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
                  placeholder="Rechercher une catégorie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  type="text"
                />
                {searchTerm && (
                  <button className="reset" type="reset" onClick={clearSearch}>
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
          </div>

          {showQuickAccess && !isSearching && currentPath.length === 0 && (
            <div className="mb-6">
              <div className="filters-section">
                <div 
                  className="filters-header"
                  onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                >
                  <div className="flex items-center gap-3">
                    <div className="filters-icon">
                      <Filter className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="filters-title">Filtres populaires</h3>
                      <p className="filters-subtitle">
                        {quickFilters.length > 0 
                          ? `${quickFilters.length} filtre(s) actif(s)` 
                          : "Filtrer par catégorie populaire"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {quickFilters.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setQuickFilters([])
                        }}
                        className="clear-filters-btn"
                      >
                        <X className="h-3 w-3" />
                        Effacer
                      </button>
                    )}
                    <div className="expand-icon">
                      {isFiltersExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>
                
                <div className={`filters-content ${isFiltersExpanded ? 'expanded' : 'collapsed'}`}>
                  <div className="filters-grid">
                    {popularCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleQuickFilter(category)}
                        className={`boton-elegante ${quickFilters.includes(category) ? 'active' : ''}`}
                      >
                        <span>{category}</span>
                        {quickFilters.includes(category) && <X className="h-3 w-3 ml-1" />}
                      </button>
                    ))}
                  </div>
                  
                  {quickFilters.length > 0 && (
                    <div className="active-filters">
                      <div className="active-filters-header">
                        <span className="active-filters-label">Filtres actifs:</span>
                        <span className="active-filters-count">{quickFilters.length}</span>
                      </div>
                      <div className="active-filters-list">
                        {quickFilters.map((filter, index) => (
                          <span key={filter} className="active-filter-item">
                            {filter}
                            {index < quickFilters.length - 1 && <span className="separator">,</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* Categories Display */}
          {loading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-6 shadow-sm border" style={{ borderColor: "#D1B8B9" }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                        <div className="space-y-2">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <div key={j} className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                          ))}
                        </div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mt-4" />
                      </div>
                      <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse ml-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="max-w-md mx-auto text-center py-12">
              <div className="rounded-xl p-6 border" style={{ backgroundColor: "#FEFEFE", borderColor: "#BE141E" }}>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3"
                  style={{ backgroundColor: "#BE141E" }}
                >
                  <X className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: "#201A1A" }}>
                  Erreur de chargement
                </h3>
                <p className="text-sm" style={{ color: "#B16C70" }}>
                  {error}
                </p>
              </div>
            </div>
          ) : isSearching ? (
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold mb-1" style={{ color: "#201A1A" }}>
                    Résultats de recherche
                    {searchTerm && ` pour "${searchTerm}"`}
                  </h2>
                  <p className="text-sm" style={{ color: "#B16C70" }}>
                    {searchResults.length} résultat(s) trouvé(s)
                    {quickFilters.length > 0 && ` avec filtres: ${quickFilters.join(", ")}`}
                  </p>
                </div>
                {quickFilters.length > 0 && (
                  <button
                    onClick={() => setQuickFilters([])}
                    className="text-xs px-3 py-1 rounded-full border hover:opacity-80 transition-opacity"
                    style={{ borderColor: "#D1B8B9", color: "#B16C70" }}
                  >
                    Effacer filtres
                  </button>
                )}
              </div>

              <div className="grid gap-3">
                {searchResults.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearchResultClick(cat)}
                    className="bg-white rounded-lg p-4 border hover:shadow-md transition-all duration-200 text-left group"
                    style={{ borderColor: "#D1B8B9" }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity"
                          style={{ backgroundColor: "#D1B8B9" }}
                        >
                          {(() => {
                            const IconComponent = getCategoryIcon(
                              (cat.levelText_4 || cat.levelText_3 || cat.levelText_2 || cat.levelText_1) as string,
                            )
                            return <IconComponent className="h-4 w-4" style={{ color: "#BE141E" }} />
                          })()}
                        </div>
                        <div className="flex-1">
                          <h3
                            className="font-semibold text-sm group-hover:opacity-80 transition-opacity"
                            style={{ color: "#201A1A" }}
                          >
                            {(cat.levelText_4 || cat.levelText_3 || cat.levelText_2 || cat.levelText_1) as string}
                          </h3>
                          <p className="text-xs mt-1" style={{ color: "#B16C70" }}>
                            {[cat.levelText_1, cat.levelText_2, cat.levelText_3, cat.levelText_4]
                              .filter(Boolean)
                              .join(" → ")}
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        className="h-4 w-4 group-hover:opacity-80 transition-opacity flex-shrink-0"
                        style={{ color: "#B16C70" }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* ... existing navigation path code ... */}
              {currentPath.length > 0 && (
                <div className="bg-white rounded-lg p-3 border shadow-sm" style={{ borderColor: "#D1B8B9" }}>
                  <div className="flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-xs">
                      <button
                        onClick={navigateToRoot}
                        className="flex items-center gap-1 font-medium hover:opacity-80 transition-opacity"
                        style={{ color: "#BE141E" }}
                      >
                        <Home className="h-3 w-3" />
                        <span>Catégories</span>
                      </button>
                      {currentPath.map((node, index) => (
                        <div key={node.id} className="flex items-center gap-2">
                          <ChevronRight className="h-3 w-3" style={{ color: "#B16C70" }} />
                          <span className="truncate max-w-24" style={{ color: "#201A1A" }}>
                            {node.text}
                          </span>
                        </div>
                      ))}
                    </nav>
                    <button
                      onClick={navigateBack}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors hover:opacity-80"
                      style={{ backgroundColor: "#D1B8B9", color: "#201A1A" }}
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span>Retour</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Main Categories Display */}
              {currentPath.length === 0 && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentLevel.map((node) => {
                      const IconComponent = getCategoryIcon(node.text)
                      const subcategories = node.children.slice(0, 6) // Show first 6 subcategories
                      const hasMoreSubcategories = node.children.length > 6
                      const isExpanded = expandedCategories.has(node.id)
                      const displayedSubcategories = isExpanded ? node.children : subcategories

                      return (
                        <div
                          key={node.id}
                          className="category-card-overlay bg-white rounded-lg border hover:shadow-md transition-all duration-200 relative overflow-hidden"
                          style={{ borderColor: "#D1B8B9" }}
                        >
                          {/* Background Image */}
                          <div className="category-image-container">
                            {(() => {
                              const categoryImage = getCategoryImage(node.text)
                              if (categoryImage) {
                                return (
                                  <img
                                    src={categoryImage || "/placeholder.svg"}
                                    alt={node.text}
                                    className="category-background-image"
                                  />
                                )
                              } else {
                                // Fallback to icon if no image found
                                return (
                                  <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: "#D1B8B9" }}
                                  >
                                    <IconComponent className="h-20 w-20" style={{ color: "#BE141E" }} />
                                  </div>
                                )
                              }
                            })()}
                          </div>

                          {/* Text Overlay */}
                          <div className="category-content-overlay">
                            <div className="flex justify-between items-start h-full">
                              {/* Left side - Category title and subcategories */}
                              <div className="flex-1 pr-4">
                                <h3 className="font-bold text-lg mb-4 text-overlay" style={{ color: "#201A1A" }}>
                                  {node.text}
                                </h3>

                                {/* Subcategories list */}
                                <div className="space-y-2 mb-4">
                                  {displayedSubcategories.map((subcat) => (
                                    <button
                                      key={subcat.id}
                                      onClick={() => navigateToCategory(subcat)}
                                      className="block text-left text-sm hover:translate-x-1 transition-transform duration-200 text-overlay-sub"
                                      style={{ color: "#B16C70" }}
                                    >
                                      {subcat.text}
                                    </button>
                                  ))}
                                </div>

                                {/* View all / Expand button */}
                                <div className="flex items-center gap-2">
                                  {hasMoreSubcategories && !isExpanded && (
                                    <button
                                      onClick={() => setExpandedCategories((prev) => new Set([...prev, node.id]))}
                                      className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                                      style={{ backgroundColor: "#BE141E", color: "white" }}
                                    >
                                      +{node.children.length - 6} plus
                                    </button>
                                  )}

                                  {isExpanded && (
                                    <button
                                      onClick={() =>
                                        setExpandedCategories((prev) => {
                                          const newSet = new Set(prev)
                                          newSet.delete(node.id)
                                          return newSet
                                        })
                                      }
                                      className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                                      style={{ backgroundColor: "#B16C70", color: "white" }}
                                    >
                                      Réduire
                                    </button>
                                  )}

                                  <button
                                    onClick={() => navigateToCategory(node)}
                                    className="text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity"
                                    style={{ backgroundColor: "#BE141E", color: "white" }}
                                  >
                                    Voir tout
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Subcategories Display */}
              {currentPath.length > 0 && (
                <div className="max-w-4xl mx-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold mb-1" style={{ color: "#201A1A" }}>
                        {currentPath[currentPath.length - 1]?.text || "Sous-catégories"}
                      </h2>
                      <p className="text-sm" style={{ color: "#B16C70" }}>
                        {currentLevel.length} sous-catégorie(s) disponible(s)
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {currentLevel.map((node) => (
                      <button
                        key={node.id}
                        onClick={() => navigateToCategory(node)}
                        className="bg-white rounded-lg p-4 border hover:shadow-md transition-all duration-200 text-left group"
                        style={{ borderColor: "#D1B8B9" }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:opacity-80 transition-opacity"
                              style={{ backgroundColor: "#D1B8B9" }}
                            >
                              {(() => {
                                const IconComponent = getCategoryIcon(node.text)
                                return <IconComponent className="h-4 w-4" style={{ color: "#BE141E" }} />
                              })()}
                            </div>
                            <div className="flex-1">
                              <h3
                                className="font-semibold text-sm group-hover:opacity-80 transition-opacity"
                                style={{ color: "#201A1A" }}
                              >
                                {node.text}
                              </h3>
                              {node.children.length > 0 && (
                                <p className="text-xs mt-1" style={{ color: "#B16C70" }}>
                                  {node.children.length} sous-catégorie(s) disponible(s)
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            className="h-4 w-4 group-hover:opacity-80 transition-opacity flex-shrink-0"
                            style={{ color: "#B16C70" }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <CartDrawer />
    </div>
  )
}
