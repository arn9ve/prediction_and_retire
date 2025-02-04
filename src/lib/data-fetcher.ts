import { ETFMarketData, getETFMarketData } from '@/lib/yahoo-finance';

export async function fetchETFData(symbol: string): Promise<ETFMarketData | null> {
  try {
    const marketData = await getETFMarketData();
    return marketData[symbol] || null;
  } catch (error) {
    console.error(`Error fetching data for ETF ${symbol}:`, error);
    return null;
  }
} 