const fs = require('fs')
const path = require('path')

// Funzione per generare dati storici simulati
function generateHistoricalData(
  startDate,
  endDate,
  startPrice,
  volatility,
  trend
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

// Configura i parametri per ogni ETF con volumi reali
const etfConfigs = {
  // S&P 500 ETFs
  VOO: { 
    startPrice: 100, 
    volatility: 0.02, 
    trend: 0.10,
    volume: '4.8M'   // Volume medio giornaliero reale
  },
  IVV: { 
    startPrice: 100, 
    volatility: 0.02, 
    trend: 0.10,
    volume: '5.2M'   // Volume medio giornaliero reale
  },
  SPY: { 
    startPrice: 100, 
    volatility: 0.02, 
    trend: 0.10,
    volume: '85.3M'  // Volume medio giornaliero reale
  },

  // Total Market ETFs
  VTI: { 
    startPrice: 90, 
    volatility: 0.02, 
    trend: 0.09,
    volume: '4.1M'   // Volume medio giornaliero reale
  },
  ITOT: { 
    startPrice: 90, 
    volatility: 0.02, 
    trend: 0.09,
    volume: '1.8M'   // Volume medio giornaliero reale
  },

  // Nasdaq ETFs
  QQQ: { 
    startPrice: 100, 
    volatility: 0.05, 
    trend: 0.15,
    volume: '45.2M'  // Volume medio giornaliero reale
  },
  QQQM: { 
    startPrice: 100, 
    volatility: 0.05, 
    trend: 0.15,
    volume: '1.2M'   // Volume medio giornaliero reale
  },
  
  // Dividend ETFs
  SCHD: { 
    startPrice: 50, 
    volatility: 0.02, 
    trend: 0.08,
    volume: '3.8M'   // Volume medio giornaliero reale
  },
  VIG: { 
    startPrice: 60, 
    volatility: 0.02, 
    trend: 0.09,
    volume: '1.1M'   // Volume medio giornaliero reale
  },
  
  // International ETFs
  VXUS: { 
    startPrice: 45, 
    volatility: 0.03, 
    trend: 0.07,
    volume: '2.9M'   // Volume medio giornaliero reale
  },
  IXUS: { 
    startPrice: 55, 
    volatility: 0.03, 
    trend: 0.07,
    volume: '0.4M'   // Volume medio giornaliero reale
  },
  
  // Sector ETFs
  XLK: { 
    startPrice: 70, 
    volatility: 0.04, 
    trend: 0.12,
    volume: '4.7M'   // Volume medio giornaliero reale
  },
  XLE: { 
    startPrice: 65, 
    volatility: 0.05, 
    trend: 0.06,
    volume: '15.8M'  // Volume medio giornaliero reale
  }
}

// Genera i dati
const startDate = new Date('2010-01-01')
const endDate = new Date('2025-01-14')

const newEtfData = {}

Object.entries(etfConfigs).forEach(([symbol, config]) => {
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

  newEtfData[symbol] = {
    historicalData,
    annualGrowth: parseFloat(annualGrowth.toFixed(2)),
    defaultGrowthRate: Math.round(annualGrowth * 10) / 10,
    volume: config.volume,  // Usa il volume reale configurato
    price: parseFloat(lastPrice.toFixed(2))
  }
})

// Leggi il file esistente
const etfDataPath = path.resolve(process.cwd(), 'src/data/etf-data.json')
console.log('Writing to:', etfDataPath)
let existingData = { etfs: {} }

try {
  existingData = JSON.parse(fs.readFileSync(etfDataPath, 'utf-8'))
  console.log('Existing ETFs:', Object.keys(existingData.etfs))
} catch (error) {
  console.log('No existing file found, creating new one')
}

// Combina i dati esistenti con i nuovi
const updatedData = {
  lastUpdated: new Date().toISOString(),
  etfs: {
    ...existingData.etfs,  // Mantieni i dati esistenti
    ...newEtfData         // Aggiungi o aggiorna i nuovi dati
  }
}

console.log('New ETFs:', Object.keys(newEtfData))
console.log('Final ETFs:', Object.keys(updatedData.etfs))

// Scrivi il file aggiornato
fs.writeFileSync(etfDataPath, JSON.stringify(updatedData, null, 2))
console.log('ETF data updated successfully') 