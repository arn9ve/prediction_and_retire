export type ETFTypeId = 
  | 'sp500' 
  | 'nasdaq100' 
  | 'total-market'

export interface ETFData {
  symbol: string
  annualGrowth: number
  defaultGrowthRate: number
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