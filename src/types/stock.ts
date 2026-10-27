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

export interface StockDetailResponse {
  id: string
  name: string
  symbol: string
  exchange: string
  sector: string | null
  price: number
  change_percent: number
  price_data_type: string
  price_interval: string
  fundamentals: {
    market_cap: number | null
    pe_ratio: number | null
    eps: number | null
    dividend_yield: number | null
    book_value: number | null
    debt_to_equity: number | null
    roe: number | null
  }
  financial_history: Array<{
    period_type: string
    period_end: string
    revenue: number | null
    operating_profit: number | null
    net_profit: number | null
    eps: number | null
  }>
  price_history: Array<{
    price: number
    open: number | null
    high: number | null
    low: number | null
    close: number
    volume: number | null
    price_timestamp: string
    data_type: string
    interval: string
  }>
}
