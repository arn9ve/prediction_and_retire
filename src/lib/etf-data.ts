import { ETFMarketData } from '@/lib/yahoo-finance';

interface HistoricalData {
  date: string;
  close: number;
}

interface ETFDataFetcher {
  getHistoricalData(symbol: string): Promise<HistoricalData[]>;
  calculateGrowthRates(data: HistoricalData[]): {
    annualGrowth: number;
    defaultGrowthRate: number;
  };
}

export class ETFDataService implements ETFDataFetcher {
  async getHistoricalData(symbol: string): Promise<HistoricalData[]> {
    try {
      const marketData = await import('@/lib/yahoo-finance').then(m => m.getETFMarketData());
      return marketData[symbol]?.historicalData || [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  calculateGrowthRates(data: HistoricalData[]): { annualGrowth: number; defaultGrowthRate: number } {
    if (data.length < 2) {
      return { annualGrowth: 0, defaultGrowthRate: 0 };
    }

    const firstPrice = data[0].close;
    const lastPrice = data[data.length - 1].close;
    const years = (new Date(data[data.length - 1].date).getTime() - new Date(data[0].date).getTime()) / (365 * 24 * 60 * 60 * 1000);

    const annualGrowth = years > 0 ? (Math.pow(lastPrice / firstPrice, 1/years) - 1) * 100 : 0;
    const defaultGrowthRate = Math.min(Math.max(annualGrowth, 0), 15); // Cap between 0% and 15%

    return { annualGrowth, defaultGrowthRate };
  }
} 