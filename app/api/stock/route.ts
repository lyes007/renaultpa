import { NextRequest, NextResponse } from 'next/server'
import { stockService } from '@/lib/stock-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { articleCodes, single } = body

    if (single && typeof single === 'string') {
      // Single article lookup
      const stockStatus = await stockService.getStockStatus(single)
      return NextResponse.json({ stockStatus })
    }

    if (Array.isArray(articleCodes)) {
      // Batch lookup
      const stockStatuses = await stockService.getStockStatusBatch(articleCodes)
      const result: Record<string, any> = {}
      
      for (const code of articleCodes) {
        const status = stockStatuses.get(code)
        result[code] = status || null
      }
      
      return NextResponse.json({ stockStatuses: result })
    }

    return NextResponse.json({ error: 'Invalid request format' }, { status: 400 })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    
    if (search) {
      const results = await stockService.searchByCode(search)
      return NextResponse.json({ results })
    }
    
    return NextResponse.json({ error: 'Search parameter required' }, { status: 400 })
  } catch (error) {
    console.error('Stock search API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
