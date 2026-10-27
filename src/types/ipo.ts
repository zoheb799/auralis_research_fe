export interface IPO {
  id: string
  name: string
  company: string
  priceRange: string
  status: 'Upcoming' | 'Listed' | 'Oversubscribed'
  launchDate: string
  closeDate: string
  summary: string
  issueSize: string
}

export interface IPOResponse {
  id: string
  name: string
  symbol: string | null
  exchange: string | null
  sector: string | null
  description: string | null
  issue_price_low: number | null
  issue_price_high: number | null
  lot_size: number | null
  issue_size: number | null
  fresh_issue_size: number | null
  open_date: string | null
  close_date: string | null
  listing_date: string | null
  ipo_status: string
  source_attribution: string | null
  source_disclaimer: string | null
}

export interface IPOAnalysis {
  growth: {
    revenue_growth: number | null
    profit_growth: number | null
    signal: string
  }
  profitability: {
    roe: number | null
    roce: number | null
    operating_margin: number | null
    net_margin: number | null
    signal: string
  }
  valuation: {
    pe_ratio: number | null
    signal: string
  }
  issue_structure: {
    issue_price_low: number | null
    issue_price_high: number | null
    lot_size: number | null
    issue_size: number | null
    fresh_issue_size: number | null
    ofs_size: number | null
    ofs_percentage: number | null
  }
  risk: {
    debt: string
    profitability: string
    valuation: string
    ofs_percentage: number | null
    signal: string
  }
}
