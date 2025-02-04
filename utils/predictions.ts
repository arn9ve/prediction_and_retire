import { unstable_cache } from 'next/cache';
import { calculateDailyGrowth } from './calculations';

interface PredictionResult {
  day: number;
  value: number;
}

export const getCachedPredictions = unstable_cache(
  async (amount: number, days: number, percentage: number): Promise<PredictionResult[]> => {
    const results = calculateDailyGrowth(amount, days, percentage);
    return results;
  },
  ['predictions-calculations'],
  { revalidate: 3600 } // Cache for 1 hour
); 