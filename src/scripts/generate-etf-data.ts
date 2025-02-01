import fs from 'fs'
import path from 'path'

// Funzione per generare dati storici simulati
function generateHistoricalData(
  startDate: Date,
  endDate: Date,
  startPrice: number,
  volatility: number,
  trend: number
) {
  const data = []
  let currentDate = new Date(startDate)
  let currentPrice = startPrice

  while (currentDate <= endDate) {
    // Aggiungi un trend generale
    currentPrice = currentPrice * (1 + trend/12)
    
    // Aggiungi volatilità casuale
    const randomChange = (Math.random() - 0.5) * volatility
    currentPrice = currentPrice * (1 + randomChange)

    data.push({
      date: currentDate.toISOString().split('T')[0],
      close: parseFloat(currentPrice.toFixed(2))
    })

    // Passa al mese successivo
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  return data
}

// Configura i parametri per ogni ETF
const etfConfigs = {
  // Nasdaq ETFs
  QQQ: { startPrice: 100, volatility: 0.05, trend: 0.15 }, // 15% trend annuale
  QQQM: { startPrice: 100, volatility: 0.05, trend: 0.15 },
  
  // Dividend ETFs
  SCHD: { startPrice: 50, volatility: 0.02, trend: 0.08 }, // 8% trend annuale
  VIG: { startPrice: 60, volatility: 0.02, trend: 0.09 },
  
  // International ETFs
  VXUS: { startPrice: 45, volatility: 0.03, trend: 0.07 }, // 7% trend annuale
  IXUS: { startPrice: 55, volatility: 0.03, trend: 0.07 },
  
  // Sector ETFs
  XLK: { startPrice: 70, volatility: 0.04, trend: 0.12 }, // 12% trend annuale
  XLE: { startPrice: 65, volatility: 0.05, trend: 0.06 }
}

// Genera i dati
const startDate = new Date('2010-01-01')
const endDate = new Date('2025-01-14') // Stessa data finale degli altri ETF

const newEtfData = Object.entries(etfConfigs).reduce((acc, [symbol, config]) => {
  const historicalData = generateHistoricalData(
    startDate,
    endDate,
    config.startPrice,
    config.volatility,
    config.trend
  )

  // Calcola la crescita annuale dagli ultimi 10 anni di dati
  const lastPrice = historicalData[historicalData.length - 1].close
  const tenYearsAgoPrice = historicalData[historicalData.length - 121].close // 120 mesi = 10 anni
  const annualGrowth = ((Math.pow(lastPrice / tenYearsAgoPrice, 1/10) - 1) * 100)

  acc[symbol] = {
    historicalData,
    annualGrowth,
    defaultGrowthRate: Math.round(annualGrowth * 10) / 10 // Arrotonda a 1 decimale
  }

  return acc
}, {} as Record<string, any>)

// Leggi il file esistente
const etfDataPath = path.join(process.cwd(), 'data', 'etf-data.json')
const existingData = JSON.parse(fs.readFileSync(etfDataPath, 'utf-8'))

// Combina i dati esistenti con i nuovi
const updatedData = {
  lastUpdated: new Date().toISOString(),
  etfs: {
    ...existingData.etfs,
    ...newEtfData
  }
}

// Scrivi il file aggiornato
fs.writeFileSync(etfDataPath, JSON.stringify(updatedData, null, 2))
console.log('ETF data updated successfully') 