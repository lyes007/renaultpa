import fs from 'fs'
import path from 'path'

export interface StockItem {
  code: string
  designation: string
  stock: number
  location: string
  purchasePrice: number
  sellPriceHT: number
  sellPriceTTC: number
}

export interface StockStatus {
  inStock: boolean
  stockLevel: number
  price: number
  priceHT: number
}

class StockService {
  private stockData: Map<string, StockItem> = new Map()
  private isLoaded = false

  private async loadStockData() {
    if (this.isLoaded) return

    try {
      const csvPath = path.join(process.cwd(), 'stock', 'Article_Imprime1.csv')
      const csvContent = fs.readFileSync(csvPath, 'utf-8')
      
      const lines = csvContent.split('\n')
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const columns = this.parseCSVLine(line)
        if (columns.length >= 7) {
          const stockItem: StockItem = {
            code: columns[0].trim(),
            designation: columns[1].trim(),
            stock: parseInt(columns[2]) || 0,
            location: columns[3].trim(),
            purchasePrice: parseFloat(columns[4]) || 0,
            sellPriceHT: parseFloat(columns[5]) || 0,
            sellPriceTTC: parseFloat(columns[6]) || 0
          }
          
          // Use code as key for lookup
          this.stockData.set(stockItem.code.toLowerCase(), stockItem)
        }
      }
      
      this.isLoaded = true
      console.log(`Loaded ${this.stockData.size} stock items`)
    } catch (error) {
      console.error('Error loading stock data:', error)
      this.isLoaded = true // Mark as loaded even on error to prevent repeated attempts
    }
  }

  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }

  async getStockStatus(articleCode: string): Promise<StockStatus | null> {
    await this.loadStockData()
    
    const stockItem = this.stockData.get(articleCode.toLowerCase())
    if (!stockItem) {
      return null
    }

    return {
      inStock: stockItem.stock > 0,
      stockLevel: stockItem.stock,
      price: stockItem.sellPriceTTC,
      priceHT: stockItem.sellPriceHT
    }
  }

  async getStockStatusBatch(articleCodes: string[]): Promise<Map<string, StockStatus>> {
    await this.loadStockData()
    
    const result = new Map<string, StockStatus>()
    
    for (const code of articleCodes) {
      const stockItem = this.stockData.get(code.toLowerCase())
      if (stockItem) {
        result.set(code, {
          inStock: stockItem.stock > 0,
          stockLevel: stockItem.stock,
          price: stockItem.sellPriceTTC,
          priceHT: stockItem.sellPriceHT
        })
      }
    }
    
    return result
  }

  async searchByCode(searchTerm: string): Promise<StockItem[]> {
    await this.loadStockData()
    
    const results: StockItem[] = []
    const searchLower = searchTerm.toLowerCase()
    
    for (const [code, item] of this.stockData) {
      if (code.includes(searchLower) || item.designation.toLowerCase().includes(searchLower)) {
        results.push(item)
      }
    }
    
    return results.slice(0, 50) // Limit results
  }
}

// Singleton instance
export const stockService = new StockService()
