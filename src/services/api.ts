import { mockHistory } from '../data/mockHistory'
import { mockIPOs } from '../data/mockIPOs'
import { mockMutualFunds } from '../data/mockMutualFunds'
import { mockStocks } from '../data/mockStocks'

export const api = {
  getStocks: async () => mockStocks,
  getStockById: async (id: string) => mockStocks.find((stock) => stock.id === id) ?? null,
  getIPOs: async () => mockIPOs,
  getMutualFunds: async () => mockMutualFunds,
  getHistory: async () => mockHistory,
  getHistoryById: async (id: string) => mockHistory.find((entry) => entry.id === id) ?? null,
}
