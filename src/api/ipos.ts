import type { AxiosResponse } from 'axios'
import { apiClient } from './client'
import type { IPO } from '../types/ipo'
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

export const fetchIPOs = (params?: ListOptions): Promise<AxiosResponse<IPO[] | PaginatedResponse<IPO>>> => {
  return apiClient.get('/ipos/', { params })
}

export const fetchIPO = (assetId: string): Promise<AxiosResponse<IPO>> => {
  return apiClient.get(`/ipos/${assetId}`)
}

export const fetchIPOAnalysis = (assetId: string): Promise<AxiosResponse<unknown>> => {
  return apiClient.get(`/ipos/${assetId}/analysis`)
}

export default {
  fetchIPOs,
  fetchIPO,
  fetchIPOAnalysis,
}
