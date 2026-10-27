export type MutualFundHorizon = 'Short Term' | 'Long Term'

export interface MutualFund {
  id: string
  name: string
  category: string
  indicativeValue?: number | null
  historicalReturn?: number | null
  investmentHorizon: MutualFundHorizon
  summary: string
  trend: 'Positive' | 'Neutral' | 'Negative'
}

export interface MutualFundResponse {
  id: string
  name: string
  symbol: string | null
  exchange: string | null
  sector: string | null
  description: string | null
  fund_house: string | null
  category: string | null
  nav: number | null
  aum: number | null
  expense_ratio: number | null
  risk_level: string | null
}

export interface MutualFundAnalysis {
  returns: {
    return_1y: number | null
    return_3y: number | null
    return_5y: number | null
    signal: string
  }
  benchmark: {
    fund_return_1y: number | null
    benchmark_return_1y: number | null
    signal: string
  }
  expense_ratio: {
    expense_ratio: number | null
    signal: string
  }
  volatility: {
    volatility: number | null
    signal: string
  }
  sharpe: {
    sharpe_ratio: number | null
    signal: string
  }
  concentration: {
    top_10_percentage: number | null
    signal: string
  }
  consistency: {
    positive_periods: number | null
    total_periods: number | null
    signal: string
  }
  risk: {
    volatility: number | null
    concentration: number | null
    signal: string
  }
}
