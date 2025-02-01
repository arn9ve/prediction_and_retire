export class ETFCache {
  private static instance: ETFCache
  private cache: Map<string, ETFData>
  
  private constructor() {
    this.cache = new Map()
    this.initAutoRefresh()
  }

  private async initAutoRefresh() {
    setInterval(async () => {
      for (const [symbol] of this.cache) {
        const newData = await apiClient.fetchUpdatedData(symbol)
        this.cache.set(symbol, newData)
      }
    }, 60 * 60 * 1000) // Aggiornamento orario
  }
} 