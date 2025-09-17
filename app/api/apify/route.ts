import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'

const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN
const ACTOR_ID = process.env.APIFY_ACTOR_ID || "Zt16dqMI2yN7Igggl"

if (!APIFY_API_TOKEN) {
  throw new Error('APIFY_API_TOKEN environment variable is required')
}

const BASE_URL = `https://api.apify.com/v2/acts/${ACTOR_ID}`

export async function POST(request: NextRequest) {
  try {
    const input = await request.json()

    const runResponse = await fetch(`${BASE_URL}/run-sync-get-dataset-items?token=${APIFY_API_TOKEN}&timeout=120`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error("[v0] API Error Response:", errorText)
      return NextResponse.json(
        { error: `Failed to run actor: ${runResponse.status}` },
        { status: runResponse.status }
      )
    }

    const responseText = await runResponse.text()

    if (!responseText || responseText.trim() === "") {
      return NextResponse.json({ data: [] })
    }

    let results
    try {
      results = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] JSON Parse Error:", parseError)
      return NextResponse.json(
        { error: 'Invalid JSON response from Apify' },
        { status: 500 }
      )
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Apify API Error:", error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
