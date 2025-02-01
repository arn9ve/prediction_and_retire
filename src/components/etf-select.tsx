'use client'

import * as React from 'react'
import { Globe, TrendingUp, Calendar } from 'lucide-react'
import { Search } from 'lucide-react'

import { ETF_TYPES } from '@/data/etf-types'
import { ETFMarketData } from '@/lib/yahoo-finance'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { formatDate, calculateDateRange } from '@/lib/utils'

interface MarketData {
  volume: string
  price: number
  lastUpdated: string
  historicalData: {
    date: string
    close: number
  }[]
  annualGrowth: number
  defaultGrowthRate: number
}

interface ETFData {
  symbol: string
  name: string
  description: string
  category?: string
}

interface ETFSelectProps {
  value: string
  onValueChange: (value: string) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  marketData: Record<string, ETFMarketData>
}

const spring = {
  type: "spring",
  stiffness: 400,
  damping: 30
}

export default function ETFSelect({ value, onValueChange, isOpen, onOpenChange, marketData }: ETFSelectProps) {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [hoveredETF, setHoveredETF] = React.useState<string | null>(null)

  // Get current ETF category
  const currentETF = React.useMemo(() => {
    for (const type of ETF_TYPES) {
      const etf = type.etfs.find(e => e.symbol === value)
      if (etf) return { ...etf, category: type.name }
    }
    return null
  }, [value])

  return (
    <MotionConfig transition={spring}>
      <div className="relative w-full">
        <motion.button
          type="button"
          onClick={() => onOpenChange(!isOpen)}
          className={cn(
            "relative flex items-center justify-between w-full rounded-lg border bg-white px-4 py-2 text-sm focus:outline-none",
            isOpen 
              ? "border-gray-300" 
              : "border-gray-200 hover:border-gray-300 transition-colors duration-200"
          )}
          initial={false}
          animate={{ scale: isOpen ? 0.98 : 1 }}
          whileHover={!isOpen ? { scale: 1.005 } : undefined}
        >
          <div className="flex gap-3 items-start">
            <div className="flex items-center gap-1">
              
              <span className="text-sm text-gray-500">ETF</span>

            </div>

            <div className="flex flex-col items-start gap-1">

              <span className="text-sm text-gray-500">
                {currentETF?.category || 'Total Market'}
              </span>

              <span className="font-medium">{value || 'ITOT'}</span>

            </div>
            


          </div>
          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="rounded-full bg-gray-100 p-2"
          >
            <Globe className="h-4 w-4 text-gray-500" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-x-0 top-full z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-xs"
              style={{ 
                height: 'calc(100vh - 300px)', // This leaves space for the header and other elements
                maxHeight: 'calc(100vh - 300px)'
              }}
            >
              <div className="sticky top-0 z-10 bg-white p-2 border-b">
                <div className="flex items-center gap-2 px-2 py-2 mb-2 border-gray-200 rounded-lg bg-gray-50">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search ETFs..." 
                    className="w-full bg-transparent border-none text-sm focus:outline-none placeholder:text-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-[1fr,auto,auto] gap-4 px-2 py-1 text-xs text-gray-500">
                  <div>SYMBOL</div>
                  <div>VOLUME</div>
                  <div>PRICE</div>
                </div>
              </div>

              <div className="overflow-y-auto h-[calc(100%-100px)] p-2">
                <div className="space-y-2">
                  {ETF_TYPES.map((type) => (
                    <div key={type.id}>
                      <div className="px-2 py-1">
                        <h4 className="text-xs font-medium py-1 border-b border-gray-200 text-gray-900">{type.name}</h4>
                      </div>
                      <div className="bg-white">
                        {type.etfs
                          .filter(etf => 
                            etf.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            etf.name.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                          .map((etf) => (
                            <Tooltip key={etf.symbol}>
                              <TooltipTrigger asChild>
                                <motion.div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => {
                                    onValueChange(etf.symbol)
                                    onOpenChange(false)
                                  }}
                                  onMouseEnter={() => setHoveredETF(etf.symbol)}
                                  onMouseLeave={() => setHoveredETF(null)}
                                  className={cn(
                                    "grid grid-cols-[1fr,auto,auto] gap-4 px-2 py-2 cursor-default select-none outline-none rounded",
                                    (hoveredETF === etf.symbol || value === etf.symbol) 
                                      ? "bg-gray-100" 
                                      : "hover:bg-gray-50"
                                  )}
                                >
                                  <div className="flex flex-col min-w-0">
                                    <span className="font-medium text-sm">{etf.symbol}</span>
                                    <span className="text-xs text-gray-500 truncate">{etf.name}</span>
                                  </div>
                                  <span className="text-sm text-gray-500 whitespace-nowrap">
                                    {marketData[etf.symbol]?.volume || '---'}
                                  </span>
                                  <span className="text-sm whitespace-nowrap">
                                    {marketData[etf.symbol]?.price 
                                      ? `$${marketData[etf.symbol].price.toFixed(2)}`
                                      : '---'
                                    }
                                  </span>
                                </motion.div>
                              </TooltipTrigger>
                              <TooltipContent 
                                side="right" 
                                className="max-w-[350px] bg-white text-gray-900 border shadow-sm p-4 text-sm leading-relaxed"
                              >
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <span className="font-medium text-base">{etf.symbol}</span>
                                      <p className="text-xs text-gray-500 mt-1">{etf.name}</p>
                                    </div>
                                  </div>

                                  <div className="border-t border-gray-100 pt-2">
                                    <div className="flex items-center gap-2 text-xs">
                                      <TrendingUp className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">Historical Growth ({marketData[etf.symbol]?.years || 0}Y):</span>
                                      <span className={cn(
                                        "font-medium",
                                        marketData[etf.symbol]?.annualGrowth > 0 ? "text-green-600" : "text-red-600"
                                      )}>
                                        {marketData[etf.symbol]?.annualGrowth 
                                          ? `${marketData[etf.symbol].annualGrowth.toFixed(2)}%`
                                          : '---'
                                        }
                                      </span>
                                    </div>
                                  </div>

                                  <p className="text-gray-600 text-sm mt-1">{etf.description}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
} 