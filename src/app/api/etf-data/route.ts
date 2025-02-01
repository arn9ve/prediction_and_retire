import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const ETF_DATA_PATH = path.join(process.cwd(), 'src/data/etf-data.json')

// Funzione per calcolare il tasso di crescita annuale medio
function calculateAverageAnnualGrowth(historicalData: any[]): number {
  if (historicalData.length < 2) return 0

  try {
    // Ordina i dati per data
    const sortedData = historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Calcola il CAGR (Compound Annual Growth Rate)
    const startValue = sortedData[0].close
    const endValue = sortedData[sortedData.length - 1].close
    const startDate = new Date(sortedData[0].date)
    const endDate = new Date(sortedData[sortedData.length - 1].date)
    
    // Calcola il numero esatto di anni tra le date
    const yearsDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    
    // Formula CAGR = (Valore Finale / Valore Iniziale)^(1/n) - 1
    let cagr = (Math.pow(endValue / startValue, 1 / yearsDiff) - 1) * 100

    // Applica fattori di correzione
    const inflationRate = 2.5  // Tasso medio di inflazione
    const etfFees = 0.1       // Commissioni ETF (0.1% per ETF come VOO)
    const tradingFees = 0.1   // Altre commissioni di trading e spread
    
    // Sottrai i fattori di correzione dal CAGR
    cagr = cagr - inflationRate - etfFees - tradingFees

    // Arrotonda a 2 decimali
    return Math.round(cagr * 100) / 100
  } catch (error) {
    console.error('Error calculating growth rate:', error)
    return 0
  }
}

// Funzione per ottenere una stima del tasso di crescita per tipo di ETF
function getDefaultGrowthRate(etfType: string): number {
  switch (etfType) {
    case 'sp500':
      return 7.0  // Media storica S&P 500 corretta per inflazione e fees
    case 'nasdaq':
      return 8.5  // NASDAQ tende ad avere rendimenti leggermente superiori
    case 'total-market':
      return 6.5  // Simile a S&P 500 ma leggermente più conservativo
    default:
      return 5.0   // Stima conservativa di default
  }
}

// Funzione per ottenere i dati storici da Yahoo Finance
async function fetchYahooFinanceData(symbol: string): Promise<any[]> {
  try {
    // Calcola il periodo di 20 anni
    const endDate = Math.floor(Date.now() / 1000)
    const startDate = endDate - (20 * 365 * 24 * 60 * 60) // 20 anni in secondi

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${startDate}&period2=${endDate}&interval=1mo`
    
    console.log(`Fetching Yahoo Finance data for ${symbol}...`)
    const response = await fetch(url)
    const data = await response.json()

    if (data.chart?.result?.[0]?.timestamp && data.chart?.result?.[0]?.indicators?.quote?.[0]?.close) {
      const timestamps = data.chart.result[0].timestamp
      const closes = data.chart.result[0].indicators.quote[0].close

      return timestamps.map((timestamp: number, index: number) => ({
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        close: closes[index] || closes[index - 1] // Use previous close if current is null
      })).filter((item: any) => item.close !== null)
    }
    
    throw new Error('Invalid data structure from Yahoo Finance')
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${symbol}:`, error)
    return []
  }
}

export async function GET() {
  try {
    const data = fs.readFileSync(ETF_DATA_PATH, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read ETF data' }, { status: 500 })
  }
}

export async function POST() {
  try {
    let currentData
    try {
      currentData = JSON.parse(fs.readFileSync(ETF_DATA_PATH, 'utf8'))
    } catch {
      currentData = { etfs: {} }
    }
    
    const ETF_SYMBOLS = ['VOO', 'SPY', 'IVV', 'QQQ', 'QQQM', 'VTI', 'ITOT']
    const updatedEtfs: Record<string, any> = {}

    for (const symbol of ETF_SYMBOLS) {
      try {
        const historicalData = await fetchYahooFinanceData(symbol)

        if (historicalData.length > 0) {
          // Calcola il tasso di crescita effettivo dai dati
          const calculatedGrowth = calculateAverageAnnualGrowth(historicalData)
          
          // Determina il tipo di ETF
          let etfType = 'default'
          if (symbol.match(/^(VOO|SPY|IVV)$/)) etfType = 'sp500'
          else if (symbol.match(/^(QQQ|QQQM)$/)) etfType = 'nasdaq'
          else if (symbol.match(/^(VTI|ITOT)$/)) etfType = 'total-market'

          // Usa il tasso calcolato se disponibile, altrimenti usa il default
          const annualGrowth = calculatedGrowth > 0 ? calculatedGrowth : getDefaultGrowthRate(etfType)

          updatedEtfs[symbol] = {
            historicalData,
            annualGrowth,
            defaultGrowthRate: getDefaultGrowthRate(etfType)
          }

          console.log(`Successfully processed ${symbol} with growth rate: ${annualGrowth}%`)
        } else {
          console.error(`No data available for ${symbol}`)
          if (currentData.etfs?.[symbol]) {
            updatedEtfs[symbol] = currentData.etfs[symbol]
          }
        }
      } catch (err) {
        console.error(`Error processing ${symbol}:`, err)
        if (currentData.etfs?.[symbol]) {
          updatedEtfs[symbol] = currentData.etfs[symbol]
        }
      }
    }

    const newData = {
      lastUpdated: new Date().toISOString(),
      etfs: updatedEtfs
    }

    fs.writeFileSync(ETF_DATA_PATH, JSON.stringify(newData, null, 2))
    
    return NextResponse.json(newData)
  } catch (error) {
    console.error('Error updating ETF data:', error)
    return NextResponse.json({ error: 'Failed to update ETF data' }, { status: 500 })
  }
} 