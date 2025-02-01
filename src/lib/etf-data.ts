// Struttura base per l'acquisizione dati
interface ETFDataFetcher {
  getHistoricalData(symbol: string): Promise<HistoricalData[]>
  calculateGrowthRates(data: HistoricalData[]): {
    annualGrowth: number
    defaultGrowthRate: number
  }
} 