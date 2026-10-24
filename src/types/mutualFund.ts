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
