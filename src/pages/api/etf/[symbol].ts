import { NextApiRequest, NextApiResponse } from 'next'
import etfService from '../../../lib/etf-service'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { symbol } = req.query
  
  if (typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Invalid symbol' })
  }

  try {
    const data = await etfService.getData(symbol.toUpperCase())
    
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=3600'
    )
    
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ETF data' })
  }
} 