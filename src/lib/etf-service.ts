import { LRUCache } from 'lru-cache'
import type { ETFData as BaseETFData } from '@/types/etf'

// Extend the base ETFData type to include historicalData
interface ETFData extends BaseETFData {
  historicalData: Array<{
    date: string
    close: number
  }>
}

interface ProjectionResults {
  conservative: number
  moderate: number
  aggressive: number
}

interface ETFStrategy {
  fetchData(symbol: string): Promise<ETFData>
  calculateProjections(data: ETFData): ProjectionResults
}

interface ETFDataClient {
  fetchLatestData(symbol: string): Promise<ETFData>
}

export class HybridETFStrategy implements ETFStrategy {
  private cache: LRUCache<string, ETFData>
  
  constructor(
    private apiClient: ETFDataClient,
    private cacheTTL: number = 3600
  ) {
    this.cache = new LRUCache({
      max: 100,
      ttl: this.cacheTTL * 1000
    })
  }

  async fetchData(symbol: string): Promise<ETFData> {
    const cachedData = this.cache.get(symbol)
    if (cachedData) return cachedData

    const liveData = await this.apiClient.fetchLatestData(symbol)
    this.cache.set(symbol, liveData)
    return liveData
  }

  private calculateGrowth(data: ETFData, multiplier: number) {
    const lastPrice = data.historicalData.slice(-1)[0].close
    return lastPrice * (1 + (data.annualGrowth * multiplier) / 100)
  }

  calculateProjections(data: ETFData): ProjectionResults {
    return {
      conservative: this.calculateGrowth(data, 0.8),
      moderate: this.calculateGrowth(data, 1),
      aggressive: this.calculateGrowth(data, 1.2)
    }
  }
} 