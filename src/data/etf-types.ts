import { ETFType } from '@/types/etf'

export interface ETF {
  symbol: string
  name: string
  description: string
}

export const ETF_TYPES: ETFType[] = [
  {
    id: 'total-market',
    name: 'Total Market ETFs',
    etfs: [
      { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', description: 'The most comprehensive US market coverage - includes large, mid, and small cap stocks.' },
      { symbol: 'ITOT', name: 'iShares Core S&P Total US Stock Market ETF', description: 'Complete US market exposure - tracks over 3000 stocks across all sizes.' },
      { symbol: 'SCHB', name: 'Schwab US Broad Market ETF', description: 'Low-cost total US market exposure - includes stocks of all sizes.' }
    ]
  },
  {
    id: 'sp500',
    name: 'S&P 500 ETFs',
    etfs: [
      { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', description: 'The lowest-cost S&P 500 ETF - tracks 500 of the largest US companies.' },
      { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', description: 'Popular S&P 500 ETF - same low cost as VOO with high liquidity.' },
      { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', description: 'The most traded S&P 500 ETF - highest liquidity and options availability.' }
    ]
  },
  {
    id: 'nasdaq100',
    name: 'Nasdaq-100 ETFs',
    etfs: [
      { symbol: 'QQQ', name: 'Invesco QQQ Trust', description: 'The most popular tech-heavy ETF - tracks 100 largest Nasdaq stocks.' },
      { symbol: 'QQQM', name: 'Invesco NASDAQ 100 ETF', description: 'Same as QQQ but with lower fees - better for long-term holding.' }
    ]
  },
  {
    id: 'sectors',
    name: 'Sector ETFs',
    etfs: [
      { symbol: 'XLK', name: 'Technology Select SPDR', description: 'Technology sector - includes software, hardware, and tech services.' },
      { symbol: 'XLF', name: 'Financial Select SPDR', description: 'Financial sector - banks, insurance, and investment firms.' },
      { symbol: 'XLV', name: 'Healthcare Select SPDR', description: 'Healthcare sector - pharma, biotech, and medical devices.' },
      { symbol: 'XLE', name: 'Energy Select SPDR', description: 'Energy sector - oil, gas, and renewable energy companies.' },
      { symbol: 'XLC', name: 'Communication Select SPDR', description: 'Communication sector - media, entertainment, and telecom.' },
      { symbol: 'XLY', name: 'Consumer Discretionary Select SPDR', description: 'Consumer discretionary - retail, auto, and leisure.' },
      { symbol: 'XLP', name: 'Consumer Staples Select SPDR', description: 'Consumer staples - food, beverage, and household products.' },
      { symbol: 'XLI', name: 'Industrial Select SPDR', description: 'Industrial sector - machinery, aerospace, and transportation.' },
      { symbol: 'XLB', name: 'Materials Select SPDR', description: 'Materials sector - chemicals, mining, and construction materials.' },
      { symbol: 'XLU', name: 'Utilities Select SPDR', description: 'Utilities sector - electric, gas, and water companies.' }
    ]
  },
  {
    id: 'dividend',
    name: 'Dividend ETFs',
    etfs: [
      { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF', description: 'High-quality dividend stocks with strong growth potential - best overall dividend ETF.' },
      { symbol: 'VIG', name: 'Vanguard Dividend Appreciation ETF', description: 'Companies with 10+ years of dividend growth - focus on dividend growth.' },
      { symbol: 'VYM', name: 'Vanguard High Dividend Yield ETF', description: 'Higher current dividend yield - good for income generation.' },
      { symbol: 'DGRO', name: 'iShares Core Dividend Growth ETF', description: 'Companies with 5+ years of dividend growth - balance of yield and growth.' },
      { symbol: 'HDV', name: 'iShares Core High Dividend ETF', description: 'Focus on high-quality companies with high dividends.' }
    ]
  },
  {
    id: 'international',
    name: 'International ETFs',
    etfs: [
      { symbol: 'VXUS', name: 'Vanguard Total International Stock ETF', description: 'Complete international exposure - all countries outside US.' },
      { symbol: 'IXUS', name: 'iShares Core MSCI Total International', description: 'Similar to VXUS - all non-US developed and emerging markets.' },
      { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', description: 'Developed markets only - Europe, Japan, Canada, etc.' },
      { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', description: 'Emerging markets only - China, India, Brazil, etc.' }
    ]
  },
  {
    id: 'factor',
    name: 'Factor ETFs',
    etfs: [
      { symbol: 'QUAL', name: 'iShares MSCI USA Quality Factor ETF', description: 'High-quality companies with strong financials.' },
      { symbol: 'MTUM', name: 'iShares MSCI USA Momentum Factor ETF', description: 'Stocks showing strong price momentum.' },
      { symbol: 'USMV', name: 'iShares MSCI USA Min Vol Factor ETF', description: 'Lower volatility stocks for more stable returns.' },
      { symbol: 'VLUE', name: 'iShares MSCI USA Value Factor ETF', description: 'Undervalued stocks trading at lower prices.' }
    ]
  },
  {
    id: 'bond',
    name: 'Bond ETFs',
    etfs: [
      { symbol: 'AGG', name: 'iShares Core US Aggregate Bond ETF', description: 'Total US bond market - government and corporate bonds.' },
      { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', description: 'Similar to AGG - comprehensive US bond exposure.' },
      { symbol: 'LQD', name: 'iShares Investment Grade Corporate Bond', description: 'High-quality corporate bonds only.' },
      { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', description: 'Long-term government bonds - highest interest rate sensitivity.' }
    ]
  },
  {
    id: 'commodity',
    name: 'Commodity ETFs',
    etfs: [
      { symbol: 'GLD', name: 'SPDR Gold Shares', description: 'Physical gold - most liquid gold ETF.' },
      { symbol: 'IAU', name: 'iShares Gold Trust', description: 'Physical gold - lower cost than GLD.' },
      { symbol: 'SLV', name: 'iShares Silver Trust', description: 'Physical silver exposure.' },
      { symbol: 'DBC', name: 'Invesco DB Commodity Index', description: 'Broad commodity exposure - oil, metals, agriculture.' }
    ]
  }
] 