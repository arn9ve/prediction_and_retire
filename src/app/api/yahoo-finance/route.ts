import { NextResponse } from 'next/server'

const YAHOO_HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
  'Accept-Language': 'en-US,en;q=0.9',
  'Origin': 'https://finance.yahoo.com',
  'Referer': 'https://finance.yahoo.com/'
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')
  const symbols = searchParams.get('symbols')
  
  if (!endpoint || !symbols) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }
  
  try {
    let url: string
    if (endpoint === 'quote') {
      url = `https://query1.finance.yahoo.com/v8/finance/quote?symbols=${symbols}`
    } else if (endpoint === 'chart') {
      const period1 = searchParams.get('period1')
      const period2 = searchParams.get('period2')
      const interval = searchParams.get('interval')
      url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbols}?period1=${period1}&period2=${period2}&interval=${interval}`
    } else {
      return NextResponse.json(
        { error: 'Invalid endpoint' },
        { status: 400 }
      )
    }
    
    console.log('Fetching from Yahoo Finance:', url)
    const response = await fetch(url, {
      headers: YAHOO_HEADERS,
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Yahoo Finance error response:', errorText)
      throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Verifica che i dati siano nel formato atteso
    if (endpoint === 'quote' && !data.quoteResponse?.result) {
      console.error('Invalid quote response:', data)
      throw new Error('Invalid quote response format')
    }
    
    if (endpoint === 'chart' && !data.chart?.result?.[0]) {
      console.error('Invalid chart response:', data)
      throw new Error('Invalid chart response format')
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch data from Yahoo Finance' },
      { status: 500 }
    )
  }
} 