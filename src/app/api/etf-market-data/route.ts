import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { ETF_TYPES } from '@/data/etf-types'

export async function GET() {
  try {
    // Ottieni tutti i simboli ETF
    const symbols = ETF_TYPES.flatMap(type => type.etfs.map(etf => etf.symbol))
    console.log('Fetching data for symbols:', symbols)

    // Ottieni i dati storici per ogni ETF
    const marketData: Record<string, any> = {}
    
    await Promise.all(symbols.map(async (symbol) => {
      try {
        // Ottieni prima i dati storici per avere la data di inizio
        const historical = await yahooFinance.historical(symbol, {
          period1: '1900-01-01',  // Una data molto indietro nel tempo
          period2: new Date(),
          interval: '1mo'
        })

        if (!historical || historical.length === 0) {
          console.warn(`No historical data found for ${symbol}`)
          return
        }

        // Ordina i dati per data
        historical.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const startDate = new Date(historical[0].date)
        const endDate = new Date(historical[historical.length - 1].date)
        const years = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
        
        // Calcola la crescita annuale
        const firstPrice = historical[0].close
        const lastPrice = historical[historical.length - 1].close
        const annualGrowth = ((Math.pow(lastPrice / firstPrice, 1/years) - 1) * 100).toFixed(2)

        // Ottieni i dati di quotazione attuali
        const quote = await yahooFinance.quote(symbol)
        if (!quote) {
          console.warn(`No quote data found for ${symbol}`)
          return
        }

        marketData[symbol] = {
          price: quote.regularMarketPrice,
          volume: formatVolume(quote.regularMarketVolume),
          inceptionDate: startDate.toISOString().split('T')[0],
          years: Math.floor(years),
          annualGrowth: parseFloat(annualGrowth)
        }

        console.log(`Processed ${symbol}:`, marketData[symbol])
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
      }
    }))

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

function formatVolume(volume: number | undefined): string {
  if (!volume) return '---'
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
} 