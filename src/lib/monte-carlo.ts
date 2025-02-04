import { type ETFData as BaseETFData } from '@/types/etf'

type ETFData = BaseETFData & {
  historicalData: Array<{
    date: string
    close: number
  }>
}

export interface MonteCarloResult {
  percentiles: {
    worst: number
    p10: number
    p25: number
    median: number
    p75: number
    p90: number
    best: number
  }
  scenarios: number[]
}

// Cache for memoization with size limit
const MAX_CACHE_SIZE = 100;
const simulationCache = new Map<string, MonteCarloResult>();

export function runMonteCarloSimulation(
  monthlyDeposit: number,
  yearsToInvest: number,
  annualGrowthRate: number,
  etfData: ETFData,
  numSimulations: number = 10000
): MonteCarloResult {
  // Create cache key based on significant input parameters
  const cacheKey = `${monthlyDeposit}-${yearsToInvest}-${annualGrowthRate}-${numSimulations}`;
  
  // Check cache first
  const cachedResult = simulationCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  // Manage cache size
  if (simulationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = simulationCache.keys().next().value;
    if (firstKey !== undefined) {
      simulationCache.delete(firstKey);
    }
  }

  // Calculate historical returns and volatility
  const returns = calculateMonthlyReturns(etfData.historicalData);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const volatility = calculateVolatility(returns, meanReturn);

  // Correction factors
  const inflationRate = 0.025; // 2.5% annual inflation
  const etfFees = 0.001; // 0.1% ETF fees
  const tradingFees = 0.001; // 0.1% trading fees
  const totalFees = etfFees + tradingFees;
  
  // Adjust mean return for fees and inflation
  const adjustedMeanReturn = meanReturn - (inflationRate / 12) - (totalFees / 12);

  // Pre-calculate constants
  const monthsToInvest = yearsToInvest * 12;
  const batchSize = Math.min(1000, numSimulations); // Adjust batch size based on simulation size
  const scenarios = new Array(numSimulations);
  
  // Generate all random numbers upfront for better performance
  const allRandomReturns = generateAllRandomReturns(numSimulations * monthsToInvest, adjustedMeanReturn, volatility);
  
  // Run simulations in batches
  for (let batchStart = 0; batchStart < numSimulations; batchStart += batchSize) {
    const currentBatchSize = Math.min(batchSize, numSimulations - batchStart);
    const batchScenarios = new Float64Array(currentBatchSize);
    
    // Process each scenario in the batch
    for (let i = 0; i < currentBatchSize; i++) {
      let balance = 0;
      const scenarioIndex = batchStart + i;
      
      // Simulate monthly investments using pre-generated random returns
      for (let month = 0; month < monthsToInvest; month++) {
        const returnIndex = scenarioIndex * monthsToInvest + month;
        balance = (balance + monthlyDeposit) * (1 + allRandomReturns[returnIndex]);
      }
      
      batchScenarios[i] = balance;
    }
    
    // Copy batch results to main array
    scenarios.splice(batchStart, currentBatchSize, ...Array.from(batchScenarios));
  }

  // Sort scenarios for percentiles
  scenarios.sort((a, b) => a - b);

  const result = {
    percentiles: {
      worst: scenarios[0],
      p10: scenarios[Math.floor(numSimulations * 0.1)],
      p25: scenarios[Math.floor(numSimulations * 0.25)],
      median: scenarios[Math.floor(numSimulations * 0.5)],
      p75: scenarios[Math.floor(numSimulations * 0.75)],
      p90: scenarios[Math.floor(numSimulations * 0.9)],
      best: scenarios[numSimulations - 1]
    },
    scenarios
  };

  // Cache the result
  simulationCache.set(cacheKey, result);
  
  return result;
}

// Generate all random returns at once for better performance
function generateAllRandomReturns(size: number, mean: number, stdDev: number): Float64Array {
  const result = new Float64Array(size);
  
  // Generate pairs of random normal values using Box-Muller transform
  for (let i = 0; i < size; i += 2) {
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    result[i] = mean + z0 * stdDev;
    if (i + 1 < size) {
      result[i + 1] = mean + z1 * stdDev;
    }
  }
  
  return result;
}

function calculateMonthlyReturns(historicalData: { date: string; close: number }[]): number[] {
  return historicalData.slice(1).map((data, i) => 
    (data.close - historicalData[i].close) / historicalData[i].close
  );
}

function calculateVolatility(returns: number[], mean: number): number {
  const squaredDiffs = returns.map(r => (r - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / returns.length);
} 