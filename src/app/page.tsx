'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { LineChart } from '@/components/ui/line-chart'
import { CalculatorIcon as CalculateIcon, Wallet, Globe, CheckIcon } from 'lucide-react'
import { runMonteCarloSimulation } from '@/lib/monte-carlo'
import { type ETFDataResponse, type ETFTypeId } from '@/types/etf'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ETFSelect from '@/components/etf-select'
import { ETF_TYPES } from '@/data/etf-types'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ETFMarketData } from '@/lib/yahoo-finance'

// API types
interface ExchangeRate {
  rate: number;
  symbol: string;
}

interface ETFData {
  symbol: string;
  name: string;
  historicalData: {
    date: string;
    close: number;
  }[];
  annualGrowth: number;
  defaultGrowthRate: number;
}

interface ETFType {
  id: string;
  name: string;
  etfs: {
    symbol: string;
    name: string;
    description: string;
  }[];
}

type ChartLine = 'interest' | 'total' | 'allTotal'

interface ProjectionResult {
  totalDeposits: number
  projectedValue: number
  monteCarloResults?: {
    percentiles: {
      worst: number
      p10: number
      p25: number
      median: number
      p75: number
      p90: number
      best: number
    }
  }
}

interface ProjectionDataPoint {
  x: number;
  interest: number;
  total: number;
  allTotal: number;
}

function calculateProjection(
  monthlyDeposit: number,
  yearsToInvest: number,
  selectedETF: string,
  marketData: Record<string, ETFMarketData> | null
): ProjectionResult {
  if (!marketData || !marketData[selectedETF]) {
    return {
      totalDeposits: 0,
      projectedValue: 0
    }
  }

  const totalDeposits = monthlyDeposit * 12 * yearsToInvest
  const etf = marketData[selectedETF]
  
  // Run Monte Carlo simulation
  const monteCarloResults = runMonteCarloSimulation(
    monthlyDeposit,
    yearsToInvest,
    etf.defaultGrowthRate,
    {
      symbol: selectedETF,
      annualGrowth: etf.annualGrowth,
      defaultGrowthRate: etf.defaultGrowthRate,
      historicalData: etf.historicalData || [
        { date: new Date().toISOString().split('T')[0], close: etf.price || 0 },
        { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], close: etf.price || 0 }
      ]
    },
    10000
  )

  // Calculate deterministic projection using default growth rate
  const monthlyRate = etf.defaultGrowthRate / 12 / 100
  let projectedValue = 0
  
  for (let month = 0; month < yearsToInvest * 12; month++) {
    projectedValue += monthlyDeposit
    projectedValue *= (1 + monthlyRate)
  }

  return {
    totalDeposits,
    projectedValue,
    monteCarloResults: {
      percentiles: monteCarloResults.percentiles
    }
  }
}

// Add descriptions for ETF types at the top with the other constants
const ETF_TYPE_DESCRIPTIONS = {
  'sp500': `The S&P 500 tracks the 500 largest U.S. companies. It's considered the benchmark for the U.S. stock market, offering broad market exposure with historically consistent returns.`,
  'nasdaq100': `The NASDAQ-100 focuses on the largest non-financial companies listed on the NASDAQ exchange. It's heavily weighted towards technology companies, offering higher growth potential with higher volatility.`,
  'total-market': `Total Market ETFs provide exposure to the entire U.S. stock market, including small, mid, and large-cap stocks. They offer the broadest diversification across all market segments.`
} as const;

const isETFTypeId = (id: string): id is ETFTypeId => {
  return ['sp500', 'nasdaq100', 'total-market'].includes(id);
};

const DEFAULT_GROWTH_RATES: Record<ETFTypeId, number> = {
  'sp500': 0,
  'nasdaq100': 0,
  'total-market': 0,
  'sectors': 0,
  'dividend': 0,
  'international': 0,
  'factor': 0,
  'bond': 0,
  'commodity': 0
};

// Aggiungiamo interfacce per i dati del paese
interface CountryInfo {
  name: string
  code: string
  currency: string
  flag: string
}

interface GeoLocation {
  country: string
  currency: string
}

const COUNTRIES: CountryInfo[] = [
  { name: 'Italy', code: 'IT', currency: 'EUR', flag: '🇮🇹' },
  { name: 'United States', code: 'US', currency: 'USD', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', currency: 'GBP', flag: '🇬🇧' },
  { name: 'Japan', code: 'JP', currency: 'JPY', flag: '🇯🇵' },
  { name: 'Switzerland', code: 'CH', currency: 'CHF', flag: '🇨🇭' },
  { name: 'Canada', code: 'CA', currency: 'CAD', flag: '🇨🇦' },
  { name: 'Australia', code: 'AU', currency: 'AUD', flag: '🇦🇺' },
  // Aggiungi altri paesi come necessario
]

// Move calculateProjection outside of the component
function calculateProjectionData(
  monthlyDeposit: number,
  annualGrowth: number,
  years: number = 30,
  conversionRate: number = 1
) {
  if (!monthlyDeposit || !annualGrowth) return [];

  const monthlyRate = annualGrowth / 12 / 100;
  const months = years * 12;
  const monthlyDepositUSD = monthlyDeposit / conversionRate;

  // Calculate base deterministic projection
  let balance = 0;
  
  // Store monthly balances for accurate yearly calculation
  const monthlyBalances = new Array(months + 1).fill(0);
  for (let month = 1; month <= months; month++) {
    balance += monthlyDepositUSD;
    balance *= (1 + monthlyRate);
    monthlyBalances[month] = balance;
  }

  // Extract yearly values from monthly balances
  const deterministicValues = [];
  for (let year = 0; year <= years; year++) {
    deterministicValues.push(monthlyBalances[year * 12] || 0);
  }

  // Calculate projection data
  return deterministicValues.map((value, index) => {
    const currentYear = new Date().getFullYear() + index;
    const totalDeposit = monthlyDepositUSD * 12 * index;
    
    return {
      x: currentYear,
      interest: Math.round((value - totalDeposit) * conversionRate),
      total: Math.round(totalDeposit * conversionRate),
      allTotal: Math.round(value * conversionRate)
    };
  });
}

export default function Home() {
  // State management
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(0)
  const [selectedCurrency, setSelectedCurrency] = useState<string>("EUR")
  const [selectedRegion, setSelectedRegion] = useState<string>("Italy")
  const [selectedETFType, setSelectedETFType] = useState<ETFTypeId>('sp500')
  const [selectedETF, setSelectedETF] = useState<string>("VOO")
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [annualGrowth, setAnnualGrowth] = useState<number>(0)
  const [chartData, setChartData] = useState<ProjectionDataPoint[]>([])
  const [userCountry, setUserCountry] = useState<CountryInfo>(COUNTRIES[0])
  const [conversionRate, setConversionRate] = useState<number>(1)
  const [hasCalculatedOnce, setHasCalculatedOnce] = useState<boolean>(false)
  const [visibleLines, setVisibleLines] = useState<Record<ChartLine, boolean>>({
    interest: true,
    total: true,
    allTotal: true
  })
  const [highlightedLine, setHighlightedLine] = useState<ChartLine | null>(null)
  const [isETFSelectOpen, setIsETFSelectOpen] = useState(false)
  const [marketData, setMarketData] = useState<Record<string, ETFMarketData>>({})
  const [yearsToRetire, setYearsToRetire] = useState<number>(2.5)
  const [inflationRate, setInflationRate] = useState<number>(2.5)
  const [totalPrediction, setTotalPrediction] = useState<number>(0)
  const [extraIncome, setExtraIncome] = useState<number>(0)
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(0)
  const [isMarketDataLoading, setIsMarketDataLoading] = useState(true)

  // Reset error when dependencies change
  useEffect(() => {
    if (error) {
      setError(null)
    }
  }, [monthlyDeposit, selectedETF, annualGrowth, error])

  // Fetch exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        const data = await response.json()
        const rates = Object.entries(data.rates).map(([symbol, rate]) => ({
          symbol,
          rate: rate as number
        }))
        setExchangeRates(rates)
      } catch (error) {
        console.error('Error fetching exchange rates:', error)
        setError('Failed to fetch exchange rates')
      }
    }

    fetchExchangeRates()
  }, []) // Empty dependency array since we only want to fetch once on mount

  // Fetch market data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsMarketDataLoading(true)
        const response = await fetch('/api/etf-market-data')
        const { marketData } = await response.json()
        setMarketData(marketData)
        setAnnualGrowth(marketData[selectedETF].annualGrowth || 0)
      } catch (error) {
        console.error('Error fetching market data:', error)
        setError('Failed to fetch market data')
      } finally {
        setIsMarketDataLoading(false)
      }
    }

    fetchMarketData()
  }, [selectedETF]) // Add selectedETF as dependency

  // Detect user's location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/')
        const data: GeoLocation = await response.json()
        const country = COUNTRIES.find(c => c.code === data.country) || COUNTRIES[0]
        setUserCountry(country)
        setSelectedCurrency(country.currency)
      } catch (error) {
        console.error('Error detecting location:', error)
      }
    }
    detectLocation()
  }, [])

  // Update conversion rate when currency changes
  useEffect(() => {
    const getConversionRate = async () => {
      if (selectedCurrency === 'USD') {
        setConversionRate(1)
        return
      }

      try {
        const rate = exchangeRates.find(r => r.symbol === selectedCurrency)?.rate || 1
        setConversionRate(rate)
      } catch (error) {
        console.error('Error getting conversion rate:', error)
        setConversionRate(1)
      }
    }
    getConversionRate()
  }, [selectedCurrency, exchangeRates])

  // Update handleCalculate to use marketData
  const handleCalculate = useCallback(() => {
    if (monthlyDeposit > 0 && marketData && annualGrowth > 0) {
      const newChartData = calculateProjectionData(
        monthlyDeposit,
        annualGrowth,
        30,
        conversionRate
      );
      setChartData(newChartData);
      setHasCalculatedOnce(true);
    } else if (!marketData || annualGrowth === 0) {
      setError('Unable to calculate: ETF data not available');
    }
  }, [monthlyDeposit, marketData, annualGrowth, conversionRate]);

  // Update the effect that updates chart data
  useEffect(() => {
    if (hasCalculatedOnce && monthlyDeposit > 0 && marketData && annualGrowth > 0) {
      const newChartData = calculateProjectionData(
        monthlyDeposit,
        annualGrowth,
        30,
        conversionRate
      );
      setChartData(newChartData);
    }
  }, [hasCalculatedOnce, monthlyDeposit, marketData, annualGrowth, conversionRate]);

  // Memoize the conversion functions to prevent unnecessary re-renders
  const convertToUSD = useCallback((value: number) => value / conversionRate, [conversionRate]);
  const convertFromUSD = useCallback((value: number) => value * conversionRate, [conversionRate]);

  return (
    <TooltipProvider>
      <div className="flex p-5 gap-5 flex-col lg:flex-row h-screen w-screen bg-white overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-[400px] flex-none lg:p-2 bg-white flex flex-col h-full">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-1">
            {/* Header - Always visible */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <Wallet className="text-white w-5 h-5" />
              </div>
              <div>
                <h2 className="font-semibold">Ide.ai</h2>
                <p className="text-sm text-muted-foreground">Saving tool prediction</p>
              </div>
            </div>

            {/* Tabs - Always visible */}
            <div className="mb-6">
              <Tabs defaultValue="prediction" className="w-full">
                <TabsList className="grid grid-cols-2 h-auto p-1 bg-slate-100">
                  <TabsTrigger value="prediction" className="text-xs py-2 data-[state=active]:bg-white">
                    Prediction
                  </TabsTrigger>
                  <TabsTrigger value="early-retire" className="text-xs py-2 data-[state=active]:bg-white">
                    Early retire
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="prediction">
                  {/* Form Fields */}
                  <div className="space-y-6 py-1">
                    {/* Content that should be hidden when ETF selector is open */}
                    <div className={cn("space-y-6", isETFSelectOpen && "hidden")}>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Prediction</h3>
                        <p className="text-sm text-muted-foreground">
                          Make a prediction about your investments on common financial instruments like ETFs.
                        </p>
                      </div>

                      {/* Region Selection */}
                      <Select 
                        value={userCountry.code}
                        onValueChange={(code) => {
                          const country = COUNTRIES.find(c => c.code === code) || COUNTRIES[0]
                          const oldCurrency = selectedCurrency
                          setUserCountry(country)
                          setSelectedCurrency(country.currency)
                          
                          // Convert the monthly deposit to the new currency
                          if (monthlyDeposit > 0 && exchangeRates.length > 0) {
                            const oldRate = exchangeRates.find(r => r.symbol === oldCurrency)?.rate || 1
                            const newRate = exchangeRates.find(r => r.symbol === country.currency)?.rate || 1
                            const valueInUSD = monthlyDeposit / oldRate
                            const valueInNewCurrency = valueInUSD * newRate
                            setMonthlyDeposit(Math.round(valueInNewCurrency))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <span>{userCountry.flag}</span>
                              <span>{userCountry.name}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Monthly Deposit */}
                      <div className="relative flex items-center">
                        <div className="absolute left-3 text-sm text-muted-foreground">
                          {selectedCurrency}
                        </div>
                        <Input
                          type="number"
                          value={monthlyDeposit || ''}
                          onChange={(e) => {
                            const value = Number(e.target.value)
                            setMonthlyDeposit(value)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && monthlyDeposit && marketData && annualGrowth > 0) {
                              handleCalculate()
                            }
                          }}
                          className={`pl-14 ring-offset-2 focus:ring-2 focus:ring-purple-600 ${!monthlyDeposit ? 'border-2 border-purple-200' : ''}`}
                          placeholder="Monthly Deposit"
                          required
                        />
                      </div>
                    </div>

                    {/* ETF Select */}
                    <ETFSelect
                      value={selectedETF}
                      onValueChange={setSelectedETF}
                      isOpen={isETFSelectOpen}
                      onOpenChange={setIsETFSelectOpen}
                      marketData={marketData}
                      isLoading={isMarketDataLoading}
                    />

                    {/* Content that should be hidden when ETF selector is open */}
                    <div className={cn("space-y-6", isETFSelectOpen && "hidden")}>
                      {/* Annual Growth Rate */}
                      <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium mb-2 block">Historical Growth</label>
                        {isLoading ? (
                          <div className="text-sm text-muted-foreground">Loading...</div>
                        ) : marketData[selectedETF] ? (
                          <div className="relative">
                            <Input
                              type="number"
                              value={annualGrowth}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value)
                                setAnnualGrowth(isNaN(value) ? 0 : value)
                              }}
                              className="pl-14 pr-8"
                              min={0}
                              max={100}
                              step={0.1}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              Rate
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                              %
                            </div>
                          </div>
                        ) : (
                          <Input
                            type="text"
                            value="Data not available"
                            disabled={true}
                          />
                        )}
                      </div>

                      {/* Error Message */}
                      {error && (
                        <div className="text-red-500 text-sm">
                          {error}
                        </div>
                      )}

                      {/* Historical Data Info */}
                      {marketData && marketData[selectedETF] && (
                        <p className="text-xs text-muted-foreground">
                          Predictions are based on historical market data. The growth rate is calculated from {
                            new Date(marketData[selectedETF].inceptionDate).getFullYear()
                          } to 2025.
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="early-retire" className="space-y-6 py-1">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Early Retire</h3>
                      <p className="text-sm text-muted-foreground">
                        Make a prediction about your retirement.
                      </p>
                    </div>

                    {/* Region Selection */}
                    <Select 
                      value={userCountry.code}
                      onValueChange={(code) => {
                        const country = COUNTRIES.find(c => c.code === code) || COUNTRIES[0]
                        setUserCountry(country)
                        setSelectedCurrency(country.currency)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <span>{userCountry.flag}</span>
                            <span>{userCountry.name}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            <div className="flex items-center gap-2">
                              <span>{country.flag}</span>
                              <span>{country.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Want to retire from */}
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        value={yearsToRetire}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setYearsToRetire(value)
                        }}
                        className="pl-14 pr-8"
                        placeholder="Want to retire from"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        Y
                      </div>
                    </div>

                    {/* Annual Inflation Rate */}
                    <div className="relative flex items-center">
                      <Input
                        type="number"
                        value={inflationRate}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setInflationRate(value)
                        }}
                        className="pl-14 pr-8"
                        placeholder="Annual Inflation Rate"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        %
                      </div>
                    </div>

                    {/* Total Prediction */}
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-sm text-muted-foreground">
                        {selectedCurrency}
                      </div>
                      <Input
                        type="number"
                        value={totalPrediction || ''}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setTotalPrediction(value)
                        }}
                        className="pl-14"
                        placeholder="Total Prediction"
                      />
                    </div>

                    {/* Extra Income */}
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-sm text-muted-foreground">
                        {selectedCurrency}
                      </div>
                      <Input
                        type="number"
                        value={extraIncome || ''}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setExtraIncome(value)
                        }}
                        className="pl-14"
                        placeholder="Monthly Deposit"
                      />
                    </div>

                    {/* Monthly Expenses */}
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-sm text-muted-foreground">
                        {selectedCurrency}
                      </div>
                      <Input
                        type="number"
                        value={monthlyExpenses || ''}
                        onChange={(e) => {
                          const value = Number(e.target.value)
                          setMonthlyExpenses(value)
                        }}
                        className="pl-14"
                        placeholder="Monthly Expenses"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Bottom Fixed Section */}
          <div className={cn("mt-auto pt-6 space-y-4 px-1", isETFSelectOpen && "hidden")}>
            <Button  
              onClick={handleCalculate}
              disabled={!monthlyDeposit || !marketData || annualGrowth === 0}
              className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-xl py-5 text-lg font-medium flex items-center justify-center gap-2"
            >
              Calculate
              <CheckIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Right Panel - Graph and Cards */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Chart Container */}
          <div className="p-4 lg:p-8 bg-gray-50 rounded-xl h-full">
            <div className="flex flex-col h-full">
              <div className="flex-1 relative min-h-[300px]">
                <LineChart 
                  data={chartData.length > 0 ? chartData : [
                    { x: new Date().getFullYear(), interest: 0, total: 0, allTotal: 0 }
                  ]}
                  className="w-full h-full"
                  currency={selectedCurrency}
                  visibleLines={visibleLines}
                  highlightedLine={highlightedLine}
                />
              </div>
            </div>
          </div>

          {/* Cards Container */}
          <div className="flex justify-between w-full h-[30%]">
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-sky-50 border border-sky-600 shadow-none w-[32%] flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center w-full h-full p-6">
                    <p className="text-3xl font-bold text-sky-600 mb-2">
                      {chartData.length > 0 ? chartData[chartData.length - 1].total.toLocaleString('en-US', {
                        style: 'currency',
                        currency: selectedCurrency,
                        maximumFractionDigits: 0,
                      }) : '0'}
                    </p>
                    <h3 className="text-sky-600 text-sm font-medium uppercase tracking-wide">Your Amount</h3>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[275px]">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <p>The total amount you've invested (your monthly deposits summed up)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-blue-50 border border-blue-600 shadow-none w-[32%] flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center w-full h-full p-6">
                    <p className="text-3xl font-bold text-blue-600 mb-2">
                      {chartData.length > 0 ? chartData[chartData.length - 1].interest.toLocaleString('en-US', {
                        style: 'currency',
                        currency: selectedCurrency,
                        maximumFractionDigits: 0,
                      }) : '0'}
                    </p>
                    <h3 className="text-blue-600 text-sm font-medium uppercase tracking-wide">Interest</h3>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[275px]">
                <p>The total interest earned on your investment over time</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-purple-50 border border-purple-600 shadow-none w-[32%] flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center w-full h-full p-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600 mb-2">
                        {chartData.length > 0 ? chartData[chartData.length - 1].allTotal.toLocaleString('en-US', {
                          style: 'currency',
                          currency: selectedCurrency,
                          maximumFractionDigits: 0,
                        }) : '0'}
                      </p>
                      <p className="text-sm text-purple-400/80">
                        {/* eslint-disable-next-line react/no-unescaped-entities */}
                        {chartData.length > 0 ? 
                          (chartData[chartData.length - 1].allTotal / Math.pow(1.025, 30)).toLocaleString('en-US', {
                            style: 'currency',
                            currency: selectedCurrency,
                            maximumFractionDigits: 0,
                          })
                          : '0'} (in today&apos;s value)
                      </p>
                    </div>
                    <h3 className="text-purple-600 text-sm font-medium uppercase tracking-wide mt-2">Total over time</h3>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[275px]">
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <p>The expected total value of your investment based on the selected growth rate. Adjusted value shows equivalent purchasing power in today's money assuming 2.5% annual inflation over 30 years.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
