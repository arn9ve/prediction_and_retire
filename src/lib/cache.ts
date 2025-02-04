import { ETFMarketData } from '@/lib/yahoo-finance';
import { getETFMarketData } from '@/lib/yahoo-finance';

export class ETFCache {
  private static instance: ETFCache
  private cache: Map<string, ETFMarketData>
  
  private constructor() {
    this.cache = new Map()
    this.initAutoRefresh()
  }

  private async initAutoRefresh() {
    setInterval(async () => {
      try {
        const marketData = await getETFMarketData()
        for (const [symbol, data] of Object.entries(marketData)) {
          this.cache.set(symbol, data)
        }
      } catch (error) {
        console.error('Failed to refresh ETF data:', error)
      }
    }, 60 * 60 * 1000) // Hourly update
  }
} 