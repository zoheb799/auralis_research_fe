import type { AxiosResponse } from 'axios'
import { apiClient } from './client'
import type { MutualFund, MutualFundAnalysis, MutualFundResponse } from '../types/mutualFund'
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

export const fetchMutualFunds = (
  params?: ListOptions,
): Promise<AxiosResponse<MutualFund[] | PaginatedResponse<MutualFund>>> => {
  return apiClient.get('/mutual-funds/', { params })
}

export const fetchMutualFund = (assetId: string): Promise<AxiosResponse<MutualFundResponse>> => {
  return apiClient.get(`/mutual-funds/${assetId}`)
}

export const fetchMutualFundAnalysis = (assetId: string): Promise<AxiosResponse<MutualFundAnalysis>> => {
  return apiClient.get(`/mutual-funds/${assetId}/analysis`)
}

export default {
  fetchMutualFunds,
  fetchMutualFund,
  fetchMutualFundAnalysis,
}
