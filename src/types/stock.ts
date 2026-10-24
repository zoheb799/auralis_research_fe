export type InvestmentHorizon = 'Short Term' | 'Long Term'
export type TrendDirection = 'Positive' | 'Neutral' | 'Negative'

export interface StockChartPoint {
  month: string
  value: number
}

export interface Stock {
  id: string
  name: string
  symbol: string
  price: number
  change: number
  historicalReturn: number
  investmentHorizon: InvestmentHorizon
  summary: string
  trend: TrendDirection
  marketCap: string
  sector: string
  description: string
  score: number
  chartData: StockChartPoint[]
  historicalValue: number
  initialInvestment: number
  historicalGain: number
}
