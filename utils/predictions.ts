import { unstable_cache } from 'next/cache';

export const getCachedPredictions = unstable_cache(
  async (amount: number, days: number, percentage: number) => {
    // Complex calculations here
    return results;
  },
  ['predictions-calculations'],
  { revalidate: 3600 } // Cache for 1 hour
); 