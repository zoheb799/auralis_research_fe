export type ResearchCategory = 'Stock' | 'IPO' | 'Mutual Fund'

export interface ResearchAsset {
  id: string
  name: string
  symbol?: string | null
  category: ResearchCategory
  context?: Array<{ label: string; value: string }>
}

export function getResearchTitle(asset: ResearchAsset) {
  return `${asset.name} — AI Research · ${asset.category}`
}

export function getResearchCategoryFromTitle(title: string): ResearchCategory | null {
  const match = title.match(/ — AI Research · (Stock|IPO|Mutual Fund)$/)
  return match ? match[1] as ResearchCategory : null
}

export function getInitialResearchPrompt(asset: ResearchAsset) {
  const context = asset.context?.length
    ? `\n\nAsset details currently available in AURALIS:\n${asset.context.map(({ label, value }) => `- ${label}: ${value}`).join('\n')}`
    : ''
  const subject = asset.symbol ? `${asset.name} (${asset.symbol})` : asset.name

  const researchAreas: Record<ResearchCategory, string[]> = {
    Stock: [
      'Business overview and revenue segments.',
      'Fundamental financial performance, revenue and profit growth.',
      'Profitability ratios and operating margins.',
      'Balance sheet strength and debt.',
      'Valuation metrics such as P/E, P/B, EPS and ROE where available.',
      'Historical stock performance.',
      'Competitive positioning and industry outlook.',
      'Management and corporate governance, where verified information is available.',
      'Key growth drivers, opportunities, and major business, financial and market risks.',
      'Long-term investment outlook with bullish, neutral and bearish scenarios.',
    ],
    IPO: [
      'Company background, business model, revenue, profitability, and historical growth.',
      'Debt and balance sheet quality.',
      'IPO issue size, price band, fresh issue versus Offer for Sale, promoter holdings, and dilution.',
      'Valuation compared with listed peers where comparable data is available.',
      'Use of IPO proceeds.',
      'Industry outlook and competitive positioning.',
      'Key strengths, major risks, and potential red flags.',
      'Separate listing speculation from fundamental business analysis and discuss long-term prospects.',
    ],
    'Mutual Fund': [
      'Fund objective, investment strategy, and category.',
      'Fund manager and management history, where available.',
      'Historical returns across relevant periods and benchmark performance.',
      'Expense ratio, portfolio allocation, concentration, top holdings, and sector exposure.',
      'Volatility, downside risk, Sharpe ratio, and other available risk-adjusted metrics.',
      'Consistency of performance, fund size, and liquidity considerations.',
      'Investment strategy, suitability, long-term strengths and weaknesses, and key risks.',
    ],
  }

  return [
    `Conduct a comprehensive ${asset.category.toLowerCase()} investment research analysis of ${subject}.`,
    `AURALIS asset reference: ${asset.id} (${asset.category}).`,
    '',
    'Evaluate:',
    ...researchAreas[asset.category].map((area, index) => `${index + 1}. ${area}`),
    context,
    '',
    'Use available verified information. Clearly distinguish actual data from estimates and AI-generated interpretation. Do not fabricate financial metrics, prices, announcements, subscription figures, issue details, or historical performance. State when information is unavailable. Never guarantee returns or present predictions as facts. Conclude with a balanced research summary, suitability considerations, and important risks.',
  ].join('\n')
}

export function getResearchSuggestions(category: ResearchCategory) {
  const suggestions: Record<ResearchCategory, string[]> = {
    Stock: [
      'What are the biggest risks?',
      'Is its current valuation justified?',
      'Compare it with its competitors.',
      'What could drive long-term growth?',
    ],
    IPO: [
      'What are the biggest IPO-specific risks?',
      'How does the valuation compare with listed peers?',
      'What will the IPO proceeds fund?',
      'Separate listing speculation from fundamentals.',
    ],
    'Mutual Fund': [
      'How has it performed against its benchmark?',
      'What are the main portfolio concentration risks?',
      'How does its expense ratio compare?',
      'Is it suitable for a long-term investor?',
    ],
  }

  return suggestions[category]
}
