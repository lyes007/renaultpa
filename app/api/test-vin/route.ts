import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vin = searchParams.get('vin') || 'WVGZZZ5NZ8W045367' // Default test VIN
    
    // Test the Apify API directly with VIN check
    const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
    const ACTOR_ID = process.env.APIFY_ACTOR_ID || "Zt16dqMI2yN7Igggl"
    
    if (!APIFY_API_TOKEN) {
      return NextResponse.json(
        { error: 'APIFY_API_TOKEN not found' },
        { status: 500 }
      )
    }

    const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}`
    
    // Try different possible VIN endpoint names
    const possibleEndpoints = [
      "vin-check",
      "get-vehicles-by-vin",
      "decode-vin", 
      "vin-decoder",
      "search-by-vin",
      "get-vehicle-by-vin"
    ]
    
    const testInput = {
      selectPageType: "vin-check",
      vinNo: vin, // Use vinNo parameter name
      langId: 4, // Use langId 4 as confirmed working
    }

    console.log("[TEST-VIN] Testing VIN check with input:", testInput)

    const response = await fetch(`${BASE_URL}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=180`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testInput),
    })

    console.log("[TEST-VIN] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[TEST-VIN] API Error Response:", errorText)
      return NextResponse.json(
        { error: `VIN check test failed: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const data = await response.text()
    console.log("[TEST-VIN] Raw response length:", data.length)
    console.log("[TEST-VIN] Raw response preview:", data.substring(0, 500))
    
    let results
    
    try {
      results = JSON.parse(data)
    } catch (parseError) {
      console.error("[TEST-VIN] JSON Parse Error:", parseError)
      return NextResponse.json(
        { error: 'Invalid JSON response from Apify', rawResponse: data.substring(0, 1000) },
        { status: 500 }
      )
    }
    
    console.log("[TEST-VIN] Parsed results:", results)
    
    return NextResponse.json({
      success: true,
      message: 'VIN check test completed',
      input: testInput,
      data: {
        hasData: !!results,
        dataLength: results?.length || 0,
        firstItem: results?.[0] || null,
        hasMatchingVehicles: !!(results?.[0]?.data?.matchingVehicles?.array),
        matchingVehiclesCount: results?.[0]?.data?.matchingVehicles?.array?.length || 0,
        rawResults: results
      }
    })
  } catch (error) {
    console.error('[TEST-VIN] VIN check test error:', error)
    return NextResponse.json(
      { error: 'VIN check test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
