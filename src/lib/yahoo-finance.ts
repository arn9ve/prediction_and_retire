import { ETF_TYPES } from '@/data/etf-types'

interface YahooFinanceQuote {
  symbol: string
  regularMarketPrice: number
  regularMarketVolume: number
  firstTradeDateMillis: number
}

interface YahooFinanceHistoricalData {
  timestamp: number[]
  close: number[]
}

export interface ETFMarketData {
  price: number
  volume: string
  inceptionDate: string
  years: number
  annualGrowth: number
  defaultGrowthRate: number
}

// Funzione per formattare il volume in formato leggibile (es: 1.2M)
function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toString()
}

// Calcola la crescita annuale media usando i prezzi storici
function calculateAnnualGrowth(historicalData: YahooFinanceHistoricalData): number {
  const prices = historicalData.close
  const timestamps = historicalData.timestamp
  
  if (prices.length < 2) return 0
  
  const firstPrice = prices[0]
  const lastPrice = prices[prices.length - 1]
  const yearsDiff = (timestamps[timestamps.length - 1] - timestamps[0]) / (365 * 24 * 60 * 60 * 1000)
  
  // Formula: (Final Value / Initial Value)^(1/n) - 1
  const annualGrowth = (Math.pow(lastPrice / firstPrice, 1/yearsDiff) - 1) * 100
  return parseFloat(annualGrowth.toFixed(2))
}

export async function getETFMarketData(): Promise<Record<string, ETFMarketData>> {
  const marketData: Record<string, ETFMarketData> = {}
  
  // Ottieni tutti i simboli ETF
  const symbols = ETF_TYPES.flatMap(type => type.etfs.map(etf => etf.symbol))
  console.log('Fetching data for symbols:', symbols)
  
  try {
    // Ottieni i dati di quotazione correnti attraverso il nostro proxy
    const quotesResponse = await fetch(`/api/yahoo-finance?endpoint=quote&symbols=${symbols.join(',')}`)
    
    if (!quotesResponse.ok) {
      const error = await quotesResponse.json()
      throw new Error(error.error || `Quotes API error: ${quotesResponse.status}`)
    }
    
    const quotesData = await quotesResponse.json()
    console.log('Quotes response:', quotesData)
    
    if (!quotesData.quoteResponse?.result) {
      throw new Error('Invalid quotes response format')
    }
    
    const quotes = quotesData.quoteResponse.result as YahooFinanceQuote[]
    
    // Per ogni ETF, ottieni i dati storici e calcola la crescita annuale
    const results = await Promise.allSettled(symbols.map(async (symbol) => {
      const quote = quotes.find(q => q.symbol === symbol)
      if (!quote) {
        console.warn(`No quote data found for ${symbol}`)
        return
      }
      
      try {
        // Ottieni i dati storici dalla data di inizio attraverso il nostro proxy
        const startDate = Math.floor(quote.firstTradeDateMillis / 1000)
        const endDate = Math.floor(Date.now() / 1000)
        
        const historicalResponse = await fetch(
          `/api/yahoo-finance?endpoint=chart&symbols=${symbol}&period1=${startDate}&period2=${endDate}&interval=1mo`
        )
        
        if (!historicalResponse.ok) {
          const error = await historicalResponse.json()
          throw new Error(error.error || `Historical API error for ${symbol}: ${historicalResponse.status}`)
        }
        
        const historicalData = await historicalResponse.json()
        console.log(`Historical data for ${symbol}:`, historicalData)
        
        if (!historicalData.chart?.result?.[0]?.indicators?.quote?.[0]) {
          throw new Error(`Invalid historical data format for ${symbol}`)
        }
        
        const result = historicalData.chart.result[0]
        
        return {
          symbol,
          data: {
            price: quote.regularMarketPrice,
            volume: formatVolume(quote.regularMarketVolume),
            inceptionDate: new Date(quote.firstTradeDateMillis).toISOString().split('T')[0],
            years: (endDate - startDate) / (365 * 24 * 60 * 60),
            annualGrowth: calculateAnnualGrowth(result.indicators.quote[0]),
            defaultGrowthRate: 0 // Assuming defaultGrowthRate is not available in the historical data
          }
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error)
        throw error
      }
    }))
    
    // Processa i risultati
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        marketData[result.value.symbol] = result.value.data
      }
    })
    
    if (Object.keys(marketData).length === 0) {
      throw new Error('No ETF data could be fetched')
    }
    
    return marketData
  } catch (error) {
    console.error('Error fetching market data:', error)
    throw error
  }
} 