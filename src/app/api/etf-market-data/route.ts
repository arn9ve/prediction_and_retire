import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { ETF_TYPES } from '@/data/etf-types'
import { ETFMarketData } from '@/lib/yahoo-finance'

export async function GET() {
  try {
    // Get all ETF symbols
    const symbols = ETF_TYPES.flatMap(type => type.etfs.map(etf => etf.symbol))
    console.log('Fetching data for symbols:', symbols)

    // Get market data for each ETF
    const marketData: Record<string, ETFMarketData> = {}
    
    await Promise.all(symbols.map(async (symbol) => {
      try {
        // Get historical data first to have start date
        const historical = await yahooFinance.historical(symbol, {
          period1: '1900-01-01',  // A date far back in time
          period2: new Date(),
          interval: '1mo'
        })

        if (!historical || historical.length === 0) {
          console.warn(`No historical data found for ${symbol}`)
          return
        }

        // Sort data by date
        historical.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const startDate = new Date(historical[0].date)
        const endDate = new Date(historical[historical.length - 1].date)
        const years = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
        
        // Calculate annual growth
        const firstPrice = historical[0].close
        const lastPrice = historical[historical.length - 1].close
        const annualGrowth = ((Math.pow(lastPrice / firstPrice, 1/years) - 1) * 100).toFixed(2)

        // Get current quote data
        const quote = await yahooFinance.quote(symbol)
        if (!quote) {
          console.warn(`No quote data found for ${symbol}`)
          return
        }

        // Handle potentially undefined or null values
        const price = typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : null
        const volume = typeof quote.regularMarketVolume === 'number' ? quote.regularMarketVolume : null

        marketData[symbol] = {
          price,
          volume: formatVolume(volume),
          inceptionDate: startDate.toISOString().split('T')[0],
          years: Math.floor(years),
          annualGrowth: parseFloat(annualGrowth),
          defaultGrowthRate: parseFloat(annualGrowth) // Use historical growth as default
        }
        
        console.log(`Processed ${symbol}:`, marketData[symbol])
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
        // Don't throw here, just log the error and continue with other symbols
      }
    }))

    // Check if we got any data
    if (Object.keys(marketData).length === 0) {
      return NextResponse.json(
        { error: 'Failed to fetch market data for any ETF' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      marketData,
      lastUpdated: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching market data:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}

function formatVolume(volume: number | null | undefined): string {
  if (!volume) return '---'
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
} 