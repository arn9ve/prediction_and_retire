import { NextResponse } from 'next/server'
import yahooFinance from 'yahoo-finance2'
import { ETF_TYPES } from '@/data/etf-types'
import { ETFMarketData } from '@/lib/yahoo-finance'

const cache = new Map<string, any>()
const CACHE_TTL = 3600 * 1000 // 1 ora in millisecondi

export async function GET() {
  try {
    // Controlla la cache prima di fare richieste
    const cachedData = cache.get('etf-market-data')
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return NextResponse.json(cachedData.data)
    }

    const symbols = ETF_TYPES.flatMap(type => type.etfs.map(etf => etf.symbol))
    
    // Ottimizzazione: fetch parallelo con limitazione
    const BATCH_SIZE = 5
    const marketData: Record<string, ETFMarketData> = {}

    for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
      const batch = symbols.slice(i, i + BATCH_SIZE)
      await Promise.all(batch.map(async (symbol) => {
        try {
          const [historical, quote] = await Promise.all([
            yahooFinance.historical(symbol, { period1: '1900-01-01', interval: '1mo' }),
            yahooFinance.quote(symbol)
          ])

          // Filtra i dati storici validi
          const validHistorical = historical.filter(h => h.close !== null && h.close !== undefined);
          
          if (validHistorical.length < 2) {
            console.warn(`Insufficient historical data for ${symbol}`);
            return null;
          }

          // Sort data by date
          validHistorical.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

          const startDate = new Date(validHistorical[0].date)
          const endDate = new Date(validHistorical[validHistorical.length - 1].date)
          const years = (endDate.getTime() - startDate.getTime()) / (365 * 24 * 60 * 60 * 1000)
          
          // Calculate annual growth
          const firstPrice = validHistorical[0].close
          const lastPrice = validHistorical[validHistorical.length - 1].close
          const annualGrowth = ((Math.pow(lastPrice / firstPrice, 1/years) - 1) * 100).toFixed(2)

          // Handle potentially undefined or null values
          const price = typeof quote.regularMarketPrice === 'number' ? quote.regularMarketPrice : null
          const volume = typeof quote.regularMarketVolume === 'number' ? quote.regularMarketVolume : null

          const annualGrowthValue = parseFloat(annualGrowth)

          // Aggiungi dati storici alla risposta
          marketData[symbol] = {
            price: price || validHistorical[validHistorical.length - 1].close || null,
            volume: formatVolume(volume),
            inceptionDate: startDate.toISOString().split('T')[0],
            years: Math.floor(years),
            annualGrowth: annualGrowthValue,
            defaultGrowthRate: annualGrowthValue,
            historicalData: validHistorical.map(h => ({
              date: h.date.toISOString().split('T')[0],
              close: h.close as number
            }))
          }
          
          console.log(`Processed ${symbol}:`, marketData[symbol])
          return marketData[symbol]
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error)
          return null;
        }
      }))
    }

    const responseData = {
      marketData,
      lastUpdated: new Date().toISOString()
    }

    cache.set('etf-market-data', {
      data: responseData,
      timestamp: Date.now()
    })
    return NextResponse.json(responseData)

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