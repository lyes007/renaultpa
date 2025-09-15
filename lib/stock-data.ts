// Stock data interface
export interface StockData {
  code: string
  designation: string
  stock: number
  emplacement: string
  prixAchat: number
  prixVenteHT: number
  prixVenteTTC: number
}

// Cache for stock data
let stockDataCache: Map<string, StockData> | null = null
let stockDataPromise: Promise<Map<string, StockData>> | null = null

// Parse CSV line
function parseCSVLine(line: string): StockData | null {
  const parts = line.split(',')
  if (parts.length < 7) return null
  
  const stock = parseInt(parts[2].trim())
  const prixAchat = parseFloat(parts[4].trim()) || 0
  const prixVenteHT = parseFloat(parts[5].trim()) || 0
  const prixVenteTTC = parseFloat(parts[6].trim()) || 0
  
  return {
    code: parts[0].trim(),
    designation: parts[1].trim(),
    stock: isNaN(stock) ? 0 : stock,
    emplacement: parts[3].trim(),
    prixAchat,
    prixVenteHT,
    prixVenteTTC
  }
}

// Load stock data from CSV
export async function loadStockData(): Promise<Map<string, StockData>> {
  if (stockDataCache) {
    return stockDataCache
  }

  // If already loading, return the existing promise
  if (stockDataPromise) {
    return stockDataPromise
  }

  stockDataPromise = (async () => {
    try {
      const response = await fetch('/stock/Article_Imprime1.csv')
      if (!response.ok) {
        throw new Error('Failed to load stock data')
      }
      
      const csvText = await response.text()
      const lines = csvText.split('\n')
      const stockMap = new Map<string, StockData>()
      
      // Skip header line (index 0) and process in batches for better performance
      const batchSize = 1000
      for (let i = 1; i < lines.length; i += batchSize) {
        const batch = lines.slice(i, i + batchSize)
        for (const line of batch) {
          const trimmedLine = line.trim()
          if (trimmedLine) {
            const stockData = parseCSVLine(trimmedLine)
            if (stockData) {
              stockMap.set(stockData.code, stockData)
            }
          }
        }
        // Allow other tasks to run between batches
        if (i + batchSize < lines.length) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }
      
      stockDataCache = stockMap
      return stockMap
    } catch (error) {
      console.error('Error loading stock data:', error)
      stockDataPromise = null // Reset promise on error
      return new Map()
    }
  })()

  return stockDataPromise
}

// Get stock data for a specific product code
export async function getStockData(productCode: string): Promise<StockData | null> {
  const stockMap = await loadStockData()
  return stockMap.get(productCode) || null
}

// Get stock data for multiple product codes at once (more efficient)
export async function getStockDataBatch(productCodes: string[]): Promise<Map<string, StockData | null>> {
  const stockMap = await loadStockData()
  const result = new Map<string, StockData | null>()
  
  for (const code of productCodes) {
    result.set(code, stockMap.get(code) || null)
  }
  
  return result
}

// Check if product is in stock
export function isInStock(stock: number): boolean {
  return stock > 0
}

// Get stock status text
export function getStockStatus(stock: number): { text: string; color: string; isInStock: boolean; priority: number } {
  if (stock > 0) {
    return {
      text: 'En stock',
      color: '#10B981', // Green
      isInStock: true,
      priority: 1 // Highest priority
    }
  } else {
    return {
      text: 'Sur commande',
      color: '#F59E0B', // Orange
      isInStock: false,
      priority: 2 // Lower priority
    }
  }
}

// Get stock priority for sorting
export function getStockPriority(stockData: StockData | null): number {
  if (!stockData) return 2 // Sur commande
  if (stockData.stock > 0) return 1 // En stock
  return 2 // Sur commande
}
