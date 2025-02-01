import { NextResponse } from 'next/server'
import etfData from '@/data/etf-data.json'

export async function GET() {
  console.log('Available ETFs:', Object.keys(etfData.etfs))
  
  const marketData = Object.entries(etfData.etfs).reduce((acc, [symbol, data]: [string, any]) => {
    acc[symbol] = {
      price: data.price || data.historicalData[data.historicalData.length - 1].close,
      volume: data.volume || '10M',
      lastUpdated: etfData.lastUpdated,
      historicalData: data.historicalData,
      annualGrowth: data.annualGrowth,
      defaultGrowthRate: data.defaultGrowthRate
    }
    
    return acc
  }, {} as Record<string, any>)

  console.log('Returning market data for ETFs:', Object.keys(marketData))
  
  return NextResponse.json({ marketData })
} 