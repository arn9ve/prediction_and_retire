const generateETFData = async (symbols: string[]) => {
  const etfData = {
    lastUpdated: new Date().toISOString(),
    etfs: {}
  }

  for (const symbol of symbols) {
    const historicalData = await fetchHistoricalData(symbol)
    
    etfData.etfs[symbol] = {
      historicalData: cleanData(historicalData),
      annualGrowth: calculateAnnualGrowth(historicalData),
      defaultGrowthRate: determineDefaultRate(historicalData)
    }
  }

  return etfData
} 