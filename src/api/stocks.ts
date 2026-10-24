import type { AxiosResponse } from 'axios'
import { apiClient } from './client'
import type { Stock } from '../types/stock'
import type { PaginatedResponse } from '../lib/apiResponse'

export interface ListOptions {
  page?: number
  page_size?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  status?: string
  category?: string
}

export const fetchStocks = (params?: ListOptions): Promise<AxiosResponse<Stock[] | PaginatedResponse<Stock>>> => {
  return apiClient.get('/stocks/', { params })
}

export const fetchStock = (assetId: string): Promise<AxiosResponse<Stock>> => {
  return apiClient.get(`/stocks/${assetId}`)
}

export const fetchStockAnalysis = (assetId: string): Promise<AxiosResponse<unknown>> => {
  return apiClient.get(`/stocks/${assetId}/analysis`)
}

export default {
  fetchStocks,
  fetchStock,
  fetchStockAnalysis,
}
