export type ETFTypeId = 
  | 'sp500' 
  | 'nasdaq100' 
  | 'dividend' 
  | 'international' 
  | 'sector'
  | 'total-market'
  | 'factor'
  | 'bond'
  | 'commodity'
  | 'real-estate'

export interface ETFData {
  symbol: string
  name: string
  description: string
  historicalData: {
    date: string
    close: number
  }[]
  annualGrowth: number
  defaultGrowthRate: number
  volume?: string
  price?: number
}

export interface ETFDataResponse {
  marketData: Record<string, ETFData>
  lastUpdated: string
}

export interface ETF {
  symbol: string
  name: string
  description: string
}

export interface ETFType {
  id: ETFTypeId
  name: string
  etfs: ETF[]
} 