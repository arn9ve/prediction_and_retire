'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Scale,
  ScaleOptionsByType,
  CartesianScaleTypeRegistry,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface LineChartProps {
  data: Array<{
    x: number
    interest: number
    total: number
    allTotal: number
  }>
  className?: string
  currency: string
  visibleLines: {
    interest: boolean
    total: boolean
    allTotal: boolean
  }
  highlightedLine?: 'interest' | 'total' | 'allTotal' | null
}

export function LineChart({ 
  data, 
  className, 
  currency = 'EUR',
  visibleLines = { interest: true, total: true, allTotal: true },
  highlightedLine = null 
}: LineChartProps) {
  const chartData = {
    labels: data.map(d => d.x),
    datasets: [
      {
        label: 'Amount',
        data: data.map(d => d.total),
        borderColor: '#0284C7', // sky-600
        backgroundColor: '#0284C7',
        tension: 0.35,
        borderWidth: highlightedLine === 'total' ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#0284C7',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        fill: false,
        hidden: !visibleLines.total
      },
      {
        label: 'Interest',
        data: data.map(d => d.interest),
        borderColor: '#2563EB', // blue-600
        backgroundColor: '#2563EB',
        tension: 0.35,
        borderWidth: highlightedLine === 'interest' ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#2563EB',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        fill: false,
        hidden: !visibleLines.interest
      },
      {
        label: 'Total',
        data: data.map(d => d.allTotal),
        borderColor: '#9333EA', // purple-600
        backgroundColor: '#9333EA',
        tension: 0.35,
        borderWidth: highlightedLine === 'allTotal' ? 3 : 2,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#9333EA',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
        fill: false,
        hidden: !visibleLines.allTotal
      }
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (items: any) => {
            const year = items[0].label
            const currentYear = new Date().getFullYear()
            const yearsFromNow = year - currentYear
            return `Year ${year} (${yearsFromNow > 0 ? '+' : ''}${yearsFromNow})`
          },
          label: (item: any) => {
            return ` ${item.dataset.label}: ${item.raw.toLocaleString('en-US', {
              style: 'currency',
              currency: currency,
              maximumFractionDigits: 0,
            })}`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'category' as const,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          padding: 8,
          callback: function(this: any, value: string | number, index: number): string {
            const year = Number(this.getLabelForValue(value))
            const currentYear = new Date().getFullYear()
            const yearsFromNow = year - currentYear
            if (index === 0 || index === data.length - 1 || yearsFromNow % 5 === 0) {
              return `+${yearsFromNow}`
            }
            return ''
          },
        },
        border: {
          display: false,
        },
      },
      y: {
        type: 'linear' as const,
        position: 'right' as const,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#6B7280',
          padding: 12,
          callback: function(this: Scale, value: string | number) {
            if (typeof value === 'number') {
              return value.toLocaleString('en-US', {
                style: 'currency',
                currency: currency,
                maximumFractionDigits: 0,
                notation: 'compact',
                compactDisplay: 'short',
              })
            }
            return value
          },
        },
        border: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  } as const

  return (
    <div className={`w-full h-full ${className}`}>
      <Line data={chartData} options={options} />
    </div>
  )
} 