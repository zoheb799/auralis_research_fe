import type { HistoryEntry } from '../types/history'

export const mockHistory: HistoryEntry[] = [
  {
    id: 'h-101',
    title: 'Stocks to invest in',
    date: '2026-09-05',
    preview: 'Recommended large-cap growth opportunities with strong historical momentum.',
    suggestions: 4,
    messages: [
      { id: 'm1', role: 'user', text: 'stocks to invest in' },
      {
        id: 'm2',
        role: 'assistant',
        text: 'For a long-term, quality-focused portfolio, I would prioritize Infosys, Reliance, and HDFC Bank based on resilience and historical performance.',
        stockIds: ['infosys', 'reliance', 'hdfc-bank'],
      },
    ],
  },
  {
    id: 'h-102',
    title: 'Best digital infrastructure plays',
    date: '2026-09-02',
    preview: 'Compared digital, telecom, and cloud-oriented businesses for long-term compounding.',
    suggestions: 3,
    messages: [
      { id: 'm3', role: 'user', text: 'best digital infrastructure plays' },
      {
        id: 'm4',
        role: 'assistant',
        text: 'The strongest digital infrastructure names include Reliance, Bharti Airtel, and a defensive large-cap IT exposure.',
        stockIds: ['reliance', 'infosys'],
      },
    ],
  },
  {
    id: 'h-103',
    title: 'IPO opportunities this quarter',
    date: '2026-08-28',
    preview: 'Reviewed upcoming IPOs and issuance quality to identify monitored listings.',
    suggestions: 2,
    messages: [
      { id: 'm5', role: 'user', text: 'IPO opportunities this quarter' },
      {
        id: 'm6',
        role: 'assistant',
        text: 'Ather Energy and a leading electronics manufacturer stand out for a watchlist based on sector tailwinds and issue quality.',
        stockIds: ['infosys'],
      },
    ],
  },
]
