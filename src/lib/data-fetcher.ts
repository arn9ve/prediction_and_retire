export async function fetchETFDATA(symbol: string): Promise<ETFData> {
  try {
    // Prima cerca nei dati statici
    const staticData = await import(`../data/etfs/${symbol}.json`)
    if (isRecent(staticData)) return staticData
    
    // Fallback all'API
    const liveData = await apiClient.fetch(symbol)
    await saveStaticBackup(symbol, liveData)
    return liveData
  } catch (error) {
    return fallbackDataService.get(symbol)
  }
} 