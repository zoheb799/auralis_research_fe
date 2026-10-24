import type { MutualFund } from '../types/mutualFund'

export const mockMutualFunds: MutualFund[] = [
  {
    id: 'axis-bluechip',
    name: 'Axis Bluechip Fund',
    category: 'Large Cap',
    indicativeValue: 143.8,
    historicalReturn: 24.3,
    investmentHorizon: 'Long Term',
    summary: 'Large-cap equity fund focused on quality businesses with a disciplined compounding approach.',
    trend: 'Positive',
  },
  {
    id: 'hdfc-index',
    name: 'HDFC Index Fund',
    category: 'Index',
    indicativeValue: 112.4,
    historicalReturn: 19.8,
    investmentHorizon: 'Long Term',
    summary: 'Broad-market index strategy designed for low-cost, diversified long-term participation.',
    trend: 'Positive',
  },
  {
    id: 'sbi-short-term',
    name: 'SBI Short Horizon Fund',
    category: 'Short Term Debt',
    indicativeValue: 76.2,
    historicalReturn: 8.9,
    investmentHorizon: 'Short Term',
    summary: 'Short-duration debt fund designed to balance liquidity with relatively stable income generation.',
    trend: 'Neutral',
  },
]
